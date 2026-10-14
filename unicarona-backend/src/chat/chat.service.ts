import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USUARIO_RESUMO } from '../usuario/usuario.service';
import { EnviarMensagemDto } from './dto/enviar-mensagem.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista de conversas da ChatScreen, com prévia e contador de não lidas. */
  async conversas(usuarioId: string) {
    const conversas = await this.prisma.conversa.findMany({
      where: { OR: [{ usuarioAId: usuarioId }, { usuarioBId: usuarioId }] },
      orderBy: { atualizadaEm: 'desc' },
      include: {
        usuarioA: { select: USUARIO_RESUMO },
        usuarioB: { select: USUARIO_RESUMO },
        carona: {
          select: { id: true, rota: { select: { origemNome: true, destinoNome: true } } },
        },
        mensagens: { orderBy: { enviadaEm: 'desc' }, take: 1 },
        _count: {
          select: { mensagens: { where: { lida: false, autorId: { not: usuarioId } } } },
        },
      },
    });

    return conversas.map((conversa) => ({
      id: conversa.id,
      contato: conversa.usuarioAId === usuarioId ? conversa.usuarioB : conversa.usuarioA,
      carona: {
        id: conversa.carona.id,
        trajeto: `${conversa.carona.rota.origemNome} → ${conversa.carona.rota.destinoNome}`,
      },
      ultimaMensagem: conversa.mensagens[0] ?? null,
      naoLidas: conversa._count.mensagens,
      atualizadaEm: conversa.atualizadaEm,
    }));
  }

  /** Abre a conversa e já marca como lidas as mensagens do outro lado. */
  async mensagens(usuarioId: string, conversaId: string) {
    const conversa = await this.garantirAcesso(usuarioId, conversaId);

    await this.prisma.mensagem.updateMany({
      where: { conversaId, autorId: { not: usuarioId }, lida: false },
      data: { lida: true },
    });

    const mensagens = await this.prisma.mensagem.findMany({
      where: { conversaId },
      orderBy: { enviadaEm: 'asc' },
      take: 200,
      include: { autor: { select: USUARIO_RESUMO } },
    });

    return {
      conversaId,
      contato: conversa.usuarioAId === usuarioId ? conversa.usuarioB : conversa.usuarioA,
      mensagens: mensagens.map((mensagem) => ({
        ...mensagem,
        minha: mensagem.autorId === usuarioId,
      })),
    };
  }

  /**
   * Envia uma mensagem. Se vier `conversaId`, usa a conversa existente; senão
   * abre (ou reaproveita) uma conversa com o destinatário na carona informada.
   * Devolve a mensagem já no formato que a ChatScreen desenha.
   */
  async enviar(usuarioId: string, dto: EnviarMensagemDto) {
    const texto = dto.texto?.trim();
    if (!texto) throw new BadRequestException('A mensagem não pode estar vazia.');

    let conversaId = dto.conversaId;

    if (!conversaId) {
      if (!dto.destinatarioId) {
        throw new BadRequestException('Informe o destinatário para iniciar uma conversa.');
      }
      if (!dto.caronaId) {
        throw new BadRequestException('Informe a carona para iniciar uma conversa.');
      }
      conversaId = await this.abrirConversa(usuarioId, dto.destinatarioId, dto.caronaId);
    }

    const conversa = await this.garantirAcesso(usuarioId, conversaId);
    const destinatarioId =
      conversa.usuarioAId === usuarioId ? conversa.usuarioBId : conversa.usuarioAId;

    const [mensagem] = await this.prisma.$transaction([
      this.prisma.mensagem.create({
        data: { conversaId: conversa.id, autorId: usuarioId, texto },
        include: { autor: { select: USUARIO_RESUMO } },
      }),
      this.prisma.conversa.update({
        where: { id: conversa.id },
        data: { atualizadaEm: new Date() },
      }),
    ]);

    // Avisa o destinatário. Se falhar, a mensagem já foi salva e segue valendo.
    await this.prisma.notificacao
      .create({
        data: {
          usuarioId: destinatarioId,
          tipo: 'MENSAGEM',
          titulo: `Nova mensagem de ${mensagem.autor.nome}`,
          mensagem: texto.length > 80 ? `${texto.slice(0, 77)}...` : texto,
          referencia: conversa.id,
        },
      })
      .catch(() => undefined);

    return { ...mensagem, conversaId: conversa.id, minha: true };
  }

  /**
   * Garante uma única conversa por par de usuários e carona.
   * Os ids são ordenados para que (A,B) e (B,A) não criem duas linhas.
   */
  async abrirConversa(usuarioId: string, destinatarioId: string, caronaId: string) {
    if (destinatarioId === usuarioId) {
      throw new BadRequestException('Não é possível conversar consigo mesmo.');
    }

    const destinatario = await this.prisma.usuario.findUnique({
      where: { id: destinatarioId },
      select: { id: true },
    });
    if (!destinatario) throw new NotFoundException('Usuário não encontrado.');

    const carona = await this.prisma.carona.findUnique({
      where: { id: caronaId },
      select: { id: true },
    });
    if (!carona) throw new NotFoundException('Carona não encontrada.');

    const [usuarioAId, usuarioBId] = [usuarioId, destinatarioId].sort();

    const conversa = await this.prisma.conversa.upsert({
      where: { usuarioAId_usuarioBId_caronaId: { usuarioAId, usuarioBId, caronaId } },
      update: {},
      create: { usuarioAId, usuarioBId, caronaId },
    });

    return conversa.id;
  }

  private async garantirAcesso(usuarioId: string, conversaId: string) {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
      include: {
        usuarioA: { select: USUARIO_RESUMO },
        usuarioB: { select: USUARIO_RESUMO },
      },
    });

    if (!conversa) throw new NotFoundException('Conversa não encontrada.');
    if (conversa.usuarioAId !== usuarioId && conversa.usuarioBId !== usuarioId) {
      throw new ForbiddenException('Você não participa desta conversa.');
    }

    return conversa;
  }
}