import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USUARIO_RESUMO } from '../usuario/usuario.service';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';

const CATEGORIAS_VALIDAS = ['pontualidade', 'seguranca', 'limpeza', 'comunicacao'];

@Injectable()
export class AvaliacaoService {
  constructor(private readonly prisma: PrismaService) {}

  /** RatingScreen. Só quem participou da viagem pode avaliar, e só uma vez. */
  async criar(autorId: string, dto: CriarAvaliacaoDto) {
    if (autorId === dto.alvoId) {
      throw new BadRequestException('Você não pode avaliar a si mesmo.');
    }

    const viagem = await this.prisma.viagem.findUnique({
      where: { id: dto.viagemId },
      include: { participantes: { select: { usuarioId: true } } },
    });

    if (!viagem) throw new NotFoundException('Viagem não encontrada.');

    const ids = viagem.participantes.map((p) => p.usuarioId);
    if (!ids.includes(autorId)) {
      throw new ForbiddenException('Você não participou desta viagem.');
    }
    if (!ids.includes(dto.alvoId)) {
      throw new BadRequestException('A pessoa avaliada não participou desta viagem.');
    }

    const jaExiste = await this.prisma.avaliacao.findUnique({
      where: {
        viagemId_autorId_alvoId: { viagemId: dto.viagemId, autorId, alvoId: dto.alvoId },
      },
    });
    if (jaExiste) throw new ConflictException('Você já avaliou esta pessoa nesta viagem.');

    if (dto.categorias) {
      for (const [chave, valor] of Object.entries(dto.categorias)) {
        if (!CATEGORIAS_VALIDAS.includes(chave)) {
          throw new BadRequestException(`Categoria desconhecida: ${chave}.`);
        }
        if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
          throw new BadRequestException(`A nota de ${chave} deve ser um inteiro de 1 a 5.`);
        }
      }
    }

    const autor = await this.prisma.usuario.findUnique({
      where: { id: autorId },
      select: { nome: true },
    });

    const [avaliacao] = await this.prisma.$transaction([
      this.prisma.avaliacao.create({
        data: {
          viagemId: dto.viagemId,
          autorId,
          alvoId: dto.alvoId,
          nota: dto.nota,
          comentario: dto.comentario,
          categorias: dto.categorias ?? undefined,
          tags: dto.tags ?? [],
        },
        include: { autor: { select: USUARIO_RESUMO } },
      }),
      this.prisma.notificacao.create({
        data: {
          usuarioId: dto.alvoId,
          tipo: 'NOVA_AVALIACAO',
          titulo: 'Nova avaliação',
          mensagem: `${autor?.nome ?? 'Alguém'} avaliou você com ${dto.nota} estrela(s).`,
          referencia: dto.viagemId,
        },
      }),
    ]);

    return avaliacao;
  }

  /**
   * Quem ainda falta avaliar numa viagem — é o que a RatingScreen precisa
   * saber para montar a lista de pessoas a avaliar.
   */
  async pendentesDaViagem(usuarioId: string, viagemId: string) {
    const viagem = await this.prisma.viagem.findUnique({
      where: { id: viagemId },
      include: {
        participantes: { include: { usuario: { select: USUARIO_RESUMO } } },
        avaliacoes: { where: { autorId: usuarioId }, select: { alvoId: true } },
        carona: {
          select: { rota: { select: { origemNome: true, destinoNome: true } } },
        },
      },
    });

    if (!viagem) throw new NotFoundException('Viagem não encontrada.');
    if (!viagem.participantes.some((p) => p.usuarioId === usuarioId)) {
      throw new ForbiddenException('Você não participou desta viagem.');
    }

    const jaAvaliados = new Set(viagem.avaliacoes.map((a) => a.alvoId));

    return {
      viagemId,
      trajeto: `${viagem.carona.rota.origemNome} → ${viagem.carona.rota.destinoNome}`,
      pendentes: viagem.participantes
        .filter((p) => p.usuarioId !== usuarioId && !jaAvaliados.has(p.usuarioId))
        .map((p) => ({ ...p.usuario, papel: p.papel })),
    };
  }

  /** Média por categoria, usada no perfil e no painel de Analytics. */
  async resumoDoUsuario(alvoId: string) {
    const avaliacoes = await this.prisma.avaliacao.findMany({
      where: { alvoId },
      select: { nota: true, categorias: true },
    });

    if (avaliacoes.length === 0) {
      return { media: 0, total: 0, distribuicao: {}, categorias: {} };
    }

    const distribuicao: Record<number, number> = {};
    const somaCategorias: Record<string, { soma: number; total: number }> = {};

    for (const avaliacao of avaliacoes) {
      distribuicao[avaliacao.nota] = (distribuicao[avaliacao.nota] ?? 0) + 1;

      const categorias = (avaliacao.categorias ?? {}) as Record<string, number>;
      for (const [chave, valor] of Object.entries(categorias)) {
        somaCategorias[chave] ??= { soma: 0, total: 0 };
        somaCategorias[chave].soma += valor;
        somaCategorias[chave].total += 1;
      }
    }

    const media = avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length;

    return {
      media: Number(media.toFixed(2)),
      total: avaliacoes.length,
      distribuicao,
      categorias: Object.fromEntries(
        Object.entries(somaCategorias).map(([chave, { soma, total }]) => [
          chave,
          Number((soma / total).toFixed(2)),
        ]),
      ),
    };
  }
}
