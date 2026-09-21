import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TipoNotificacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Abas da NotificationsScreen mapeadas para os tipos gravados no banco. */
const GRUPOS: Record<string, TipoNotificacao[]> = {
  caronas: [
    TipoNotificacao.SOLICITACAO_CARONA,
    TipoNotificacao.SOLICITACAO_RESPONDIDA,
    TipoNotificacao.CARONA_CANCELADA,
    TipoNotificacao.LEMBRETE_CARONA,
  ],
  avaliacoes: [TipoNotificacao.NOVA_AVALIACAO],
  mensagens: [TipoNotificacao.MENSAGEM],
  verificacao: [TipoNotificacao.VERIFICACAO],
};

@Injectable()
export class NotificacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(usuarioId: string, grupo?: string) {
    const where: Prisma.NotificacaoWhereInput = { usuarioId };

    const tipos = grupo ? GRUPOS[grupo.toLowerCase()] : undefined;
    if (tipos) where.tipo = { in: tipos };

    const [itens, naoLidas] = await Promise.all([
      this.prisma.notificacao.findMany({
        where,
        orderBy: { criadaEm: 'desc' },
        take: 100,
      }),
      this.prisma.notificacao.count({ where: { usuarioId, lida: false } }),
    ]);

    return { itens, naoLidas };
  }

  contarNaoLidas(usuarioId: string) {
    return this.prisma.notificacao
      .count({ where: { usuarioId, lida: false } })
      .then((total) => ({ total }));
  }

  async marcarComoLida(usuarioId: string, id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!notificacao) throw new NotFoundException('Notificação não encontrada.');
    if (notificacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Esta notificação não é sua.');
    }

    return this.prisma.notificacao.update({ where: { id }, data: { lida: true } });
  }

  async marcarTodasComoLidas(usuarioId: string) {
    const { count } = await this.prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });

    return { message: `${count} notificação(ões) marcada(s) como lida(s).` };
  }
}
