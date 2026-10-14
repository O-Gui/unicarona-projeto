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
  // Exibe mensagens diretas de chat e anúncios do sistema na aba "Mensagens" do App
  mensagens: [
    TipoNotificacao.MENSAGEM,
    TipoNotificacao.ANUNCIO_SISTEMA,
  ],
  verificacao: [TipoNotificacao.VERIFICACAO],
  // Grupo dedicado caso queira filtrar apenas avisos de sistema no futuro
  sistema: [TipoNotificacao.ANUNCIO_SISTEMA],
};

@Injectable()
export class NotificacaoService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // GESTÃO E DISPARO DE ANÚNCIOS DO SISTEMA
  // =========================================================================

  /** Dispara os anúncios de boas-vindas para todos os usuários cadastrados */
  async dispararAnunciosParaTodos() {
    const usuarios = await this.prisma.usuario.findMany({
      select: { id: true },
    });

    for (const usuario of usuarios) {
      await this.enviarAnunciosDeBoasVindas(usuario.id);
    }

    return {
      message: `Anúncios processados com sucesso para ${usuarios.length} usuário(s)!`,
    };
  }

  /** Envia os 3 anúncios padrão para um usuário específico (com checagem de duplicação por título) */
  async enviarAnunciosDeBoasVindas(usuarioId: string) {
    const anuncios = [
      {
        titulo: 'Semana Acadêmica',
        mensagem: '🎓 Semana acadêmica: caronas com 50% de desconto',
      },
      {
        titulo: 'Novas Rotas',
        mensagem: '🚗 Novo trajeto disponível: Campus Sul → Centro',
      },
      {
        titulo: 'Promoção Motorista',
        mensagem: '📢 Cadastre seu veículo e ganhe R$ 10 de bônus',
      },
    ];

    for (const anuncio of anuncios) {
      const existente = await this.prisma.notificacao.findFirst({
        where: {
          usuarioId,
          tipo: TipoNotificacao.ANUNCIO_SISTEMA,
          titulo: anuncio.titulo,
        },
      });

      if (!existente) {
        await this.prisma.notificacao.create({
          data: {
            usuarioId,
            tipo: TipoNotificacao.ANUNCIO_SISTEMA,
            titulo: anuncio.titulo,
            mensagem: anuncio.mensagem,
          },
        });
      }
    }
  }

  /** Remove todos os anúncios do sistema gravados na base de dados (utilitário de teste/limpeza) */
  async limparAnuncios() {
    const apagados = await this.prisma.notificacao.deleteMany({
      where: { tipo: TipoNotificacao.ANUNCIO_SISTEMA },
    });
    return { message: `Limpeza concluída! ${apagados.count} anúncios antigos apagados.` };
  }

  // =========================================================================
  // MÉTODOS DE LEITURA E CONTAGEM (CONSUMIDOS PELO APP)
  // =========================================================================

  /** Conta APENAS conversas diretas de chat não lidas para o badge do ícone de Bate-papo (BottomNav) */
  contarMensagensNaoLidas(usuarioId: string) {
    return this.prisma.notificacao
      .count({
        where: {
          usuarioId,
          lida: false,
          tipo: TipoNotificacao.MENSAGEM, // Exclui estritamente os anúncios do sistema do badge
        },
      })
      .then((total) => ({ total }));
  }

  /** Lista as notificações do usuário logado, filtrando opcionalmente por grupo/aba */
  async listar(usuarioId: string, grupo?: string) {
    if (!usuarioId) {
      return { itens: [], naoLidas: 0 };
    }

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

  /** Marca uma notificação individual como lida */
  async marcarComoLida(usuarioId: string, id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!notificacao) throw new NotFoundException('Notificação não encontrada.');
    if (notificacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Esta notificação não é sua.');
    }

    return this.prisma.notificacao.update({ where: { id }, data: { lida: true } });
  }

  /** Marca todas as notificações do usuário como lidas */
  async marcarTodasComoLidas(usuarioId: string) {
    const { count } = await this.prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });

    return { message: `${count} notificação(ões) marcada(s) como lida(s).` };
  }
}