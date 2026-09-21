import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusVerificacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { EnviarDocumentosDto } from './dto/enviar-documentos.dto';

/** Campos públicos de um usuário — nunca expõe senhaHash. */
export const USUARIO_PUBLICO = {
  id: true,
  nome: true,
  email: true,
  cpf: true,
  perfil: true,
  emailValidado: true,
  curso: true,
  universidade: true,
  telefone: true,
  bio: true,
  fotoUrl: true,
  preferencias: true,
  statusVerificacao: true,
  criadoEm: true,
} satisfies Prisma.UsuarioSelect;

/** Versão enxuta usada quando o usuário aparece embutido em outro recurso. */
export const USUARIO_RESUMO = {
  id: true,
  nome: true,
  email: true,
  curso: true,
  fotoUrl: true,
  statusVerificacao: true,
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findByCpf(cpf: string) {
    return this.prisma.usuario.findUnique({ where: { cpf } });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  /** Perfil completo já com média de avaliações e contadores das telas. */
  async perfilCompleto(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { ...USUARIO_PUBLICO, veiculos: true },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    const [agregado, estatisticas] = await Promise.all([
      this.prisma.avaliacao.aggregate({
        where: { alvoId: id },
        _avg: { nota: true },
        _count: { _all: true },
      }),
      this.estatisticas(id),
    ]);

    return {
      ...usuario,
      avaliacaoMedia: Number((agregado._avg.nota ?? 0).toFixed(2)),
      totalAvaliacoes: agregado._count._all,
      estatisticas,
    };
  }

  async atualizar(id: string, dto: UpdateUsuarioDto) {
    await this.garantirExiste(id);
    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: USUARIO_PUBLICO,
    });
  }

  /**
   * Números que alimentam Home, Profile, Histórico e Analytics.
   * Tudo derivado de Participacao/Viagem, que são as tabelas de histórico.
   */
  async estatisticas(id: string) {
    const participacoes = await this.prisma.participacao.findMany({
      where: { usuarioId: id },
      select: {
        papel: true,
        valorPago: true,
        viagem: {
          select: {
            concluidaEm: true,
            carona: { select: { rota: { select: { origemNome: true, destinoNome: true } } } },
          },
        },
      },
    });

    const oferecidas = participacoes.filter((p) => p.papel === 'MOTORISTA');
    const recebidas = participacoes.filter((p) => p.papel === 'PASSAGEIRO');

    const somar = (lista: typeof participacoes) =>
      lista.reduce((total, item) => total + Number(item.valorPago), 0);

    // ~0,19 kg de CO2 evitados por km de carro solo; usamos 12 km como
    // trajeto médio de campus. Serve para o painel de Analytics.
    const co2EvitadoKg = Number((participacoes.length * 12 * 0.19).toFixed(1));

    const contagemRotas = new Map<string, number>();
    for (const p of participacoes) {
      const rota = p.viagem?.carona?.rota;
      if (!rota) continue;
      const chave = `${rota.origemNome} → ${rota.destinoNome}`;
      contagemRotas.set(chave, (contagemRotas.get(chave) ?? 0) + 1);
    }

    const rotasFrequentes = [...contagemRotas.entries()]
      .map(([rota, vezes]) => ({ rota, vezes }))
      .sort((a, b) => b.vezes - a.vezes)
      .slice(0, 5);

    return {
      totalViagens: participacoes.length,
      caronasOferecidas: oferecidas.length,
      caronasRecebidas: recebidas.length,
      totalGanho: Number(somar(oferecidas).toFixed(2)),
      totalGasto: Number(somar(recebidas).toFixed(2)),
      co2EvitadoKg,
      rotasFrequentes,
    };
  }

  /** UC07: recebe os documentos e coloca a conta em análise. */
  async enviarDocumentos(id: string, dto: EnviarDocumentosDto) {
    await this.garantirExiste(id);

    await this.prisma.$transaction([
      ...dto.documentos.map((doc) =>
        this.prisma.documentoVerificacao.upsert({
          where: { usuarioId_tipo: { usuarioId: id, tipo: doc.tipo } },
          update: { arquivoUrl: doc.arquivoUrl, enviadoEm: new Date() },
          create: { usuarioId: id, tipo: doc.tipo, arquivoUrl: doc.arquivoUrl },
        }),
      ),
      this.prisma.usuario.update({
        where: { id },
        data: { statusVerificacao: StatusVerificacao.PENDENTE },
      }),
      this.prisma.notificacao.create({
        data: {
          usuarioId: id,
          tipo: 'VERIFICACAO',
          titulo: 'Documentos recebidos',
          mensagem: 'Sua verificação de identidade está em análise. O retorno sai em até 24 horas.',
        },
      }),
    ]);

    return {
      message: 'Documentos enviados para verificação.',
      statusVerificacao: StatusVerificacao.PENDENTE,
    };
  }

  async statusVerificacao(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { statusVerificacao: true, documentos: { select: { tipo: true, enviadoEm: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');
    return usuario;
  }

  /** Avaliações recebidas, usadas na aba de reviews do perfil. */
  async avaliacoesRecebidas(id: string) {
    return this.prisma.avaliacao.findMany({
      where: { alvoId: id },
      orderBy: { criadaEm: 'desc' },
      take: 50,
      select: {
        id: true,
        nota: true,
        comentario: true,
        tags: true,
        criadaEm: true,
        autor: { select: USUARIO_RESUMO },
      },
    });
  }

  private async garantirExiste(id: string) {
    const existe = await this.prisma.usuario.findUnique({ where: { id }, select: { id: true } });
    if (!existe) throw new NotFoundException('Usuário não encontrado.');
  }
}
