import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ErrorState, Header, Loading } from '../components/ui';
import { Icon, NomeIcone } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { tempoRelativo } from '../lib/format';
import { notificacaoService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';
import type { Notificacao, TipoNotificacao } from '../lib/tipos';

/** UC — Notificações. Consome GET /notificacoes com os grupos do backend. */

const ABAS: { label: string; grupo?: string }[] = [
  { label: 'Todas' },
  { label: 'Caronas', grupo: 'caronas' },
  { label: 'Mensagens', grupo: 'mensagens' },
  { label: 'Avaliações', grupo: 'avaliacoes' },
  { label: 'Verificação', grupo: 'verificacao' },
];

const VISUAL: Record<TipoNotificacao, { icone: NomeIcone; cor: string }> = {
  SOLICITACAO_CARONA: { icone: 'users', cor: colors.orange },
  SOLICITACAO_RESPONDIDA: { icone: 'check-circle', cor: colors.success },
  CARONA_CANCELADA: { icone: 'alert-circle', cor: colors.destructive },
  LEMBRETE_CARONA: { icone: 'map-pin', cor: colors.navy },
  NOVA_AVALIACAO: { icone: 'star', cor: colors.orange },
  VERIFICACAO: { icone: 'shield', cor: colors.navy },
  MENSAGEM: { icone: 'message-circle', cor: colors.navy },
};

export function NotificationsScreen() {
  const { voltar, navegar } = useNavigation();
  const [aba, setAba] = useState(0);

  const lista = useCarregar(() => notificacaoService.listar(ABAS[aba].grupo), [aba]);

  const abrir = async (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      try {
        await notificacaoService.ler(notificacao.id);
        lista.definir({
          itens: (lista.dados?.itens ?? []).map((item) =>
            item.id === notificacao.id ? { ...item, lida: true } : item,
          ),
          naoLidas: Math.max(0, (lista.dados?.naoLidas ?? 1) - 1),
        });
      } catch {
        // Marcar como lida é secundário: se falhar, a navegação continua.
      }
    }

    if (!notificacao.referencia) return;

    switch (notificacao.tipo) {
      case 'SOLICITACAO_CARONA':
      case 'SOLICITACAO_RESPONDIDA':
      case 'CARONA_CANCELADA':
      case 'LEMBRETE_CARONA':
        navegar('ride-details', { caronaId: notificacao.referencia });
        break;
      case 'MENSAGEM':
        navegar('chat', { conversaId: notificacao.referencia });
        break;
      case 'NOVA_AVALIACAO':
        navegar('history');
        break;
    }
  };

  const marcarTodas = async () => {
    try {
      await notificacaoService.lerTodas();
      await lista.recarregar();
    } catch {
      // Sem ação: o estado atual continua válido.
    }
  };

  const itens = lista.dados?.itens ?? [];

  return (
    <View style={estilos.tela}>
      <Header
        titulo="Notificações"
        onVoltar={voltar}
        acao={
          <Pressable onPress={marcarTodas} hitSlop={8}>
            <Text style={estilos.acaoHeader}>Marcar todas lidas</Text>
          </Pressable>
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.abas}
        >
          {ABAS.map((item, indice) => (
            <Pressable
              key={item.label}
              onPress={() => setAba(indice)}
              style={[estilos.aba, indice === aba && estilos.abaAtiva]}
            >
              <Text style={[estilos.abaTexto, indice === aba && estilos.abaTextoAtivo]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {lista.carregando ? (
          <Loading />
        ) : lista.erro ? (
          <ErrorState mensagem={lista.erro} onTentarNovamente={lista.recarregar} />
        ) : itens.length === 0 ? (
          <EmptyState
            icone="bell"
            titulo="Nenhuma notificação"
            descricao="Você está em dia com tudo por aqui."
          />
        ) : (
          itens.map((notificacao) => {
            const visual = VISUAL[notificacao.tipo] ?? { icone: 'bell' as NomeIcone, cor: colors.navy };

            return (
              <Pressable
                key={notificacao.id}
                onPress={() => abrir(notificacao)}
                style={({ pressed }) => [
                  estilos.item,
                  !notificacao.lida && estilos.itemNaoLido,
                  pressed && estilos.pressionado,
                ]}
              >
                <View style={[estilos.bolha, { backgroundColor: `${visual.cor}1F` }]}>
                  <Icon name={visual.icone} size={18} color={visual.cor} />
                </View>

                <View style={estilos.flex}>
                  <View style={estilos.linhaTitulo}>
                    <Text style={estilos.titulo} numberOfLines={1}>
                      {notificacao.titulo}
                    </Text>
                    {!notificacao.lida ? <View style={estilos.pontoNaoLido} /> : null}
                  </View>
                  <Text style={estilos.mensagem}>{notificacao.mensagem}</Text>
                  <Text style={estilos.tempo}>{tempoRelativo(notificacao.criadaEm)}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pressionado: { opacity: 0.85 },

  acaoHeader: { ...typography.smallMedium, color: colors.white },
  abas: { gap: spacing.sm, marginTop: spacing.lg },
  aba: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: tints.onNavy,
  },
  abaAtiva: { backgroundColor: colors.orange },
  abaTexto: { ...typography.smallMedium, color: colors.white },
  abaTextoAtivo: { color: colors.white },

  conteudo: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxl },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  itemNaoLido: { borderColor: colors.orange },
  bolha: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  linhaTitulo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titulo: { ...typography.smallMedium, color: colors.navy, flex: 1 },
  pontoNaoLido: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange },
  mensagem: { ...typography.small, color: colors.mutedForeground, marginTop: 2 },
  tempo: { ...typography.caption, color: colors.mutedForeground, marginTop: spacing.sm },
});
