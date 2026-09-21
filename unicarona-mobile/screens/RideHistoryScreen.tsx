import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Button, EmptyState, ErrorState, Header, HeaderStat, Loading } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { formatarData, formatarMoeda } from '../lib/format';
import { caronaService, usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

/** UC — Histórico. GET /caronas/historico + GET /usuarios/me/estatisticas. */

const FILTROS = [
  { label: 'Todas', valor: 'todas' },
  { label: 'Oferecidas', valor: 'oferecida' },
  { label: 'Recebidas', valor: 'recebida' },
] as const;

export function RideHistoryScreen() {
  const { navegar } = useNavigation();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]['valor']>('todas');

  const historico = useCarregar(() => caronaService.historico(), []);
  const estatisticas = useCarregar(() => usuarioService.estatisticas(), []);

  const itens = useMemo(() => {
    const todos = historico.dados ?? [];
    return filtro === 'todas' ? todos : todos.filter((item) => item.tipo === filtro);
  }, [historico.dados, filtro]);

  return (
    <View style={estilos.tela}>
      <Header titulo="Histórico">
        <View style={estilos.resumo}>
          <HeaderStat label="Viagens" valor={estatisticas.dados?.totalViagens ?? '—'} />
          <HeaderStat
            label="Ganhos"
            valor={estatisticas.dados ? formatarMoeda(estatisticas.dados.totalGanho) : '—'}
          />
          <HeaderStat
            label="Gastos"
            valor={estatisticas.dados ? formatarMoeda(estatisticas.dados.totalGasto) : '—'}
          />
        </View>
      </Header>

      <View style={estilos.filtros}>
        {FILTROS.map((item) => (
          <Pressable
            key={item.valor}
            onPress={() => setFiltro(item.valor)}
            style={[estilos.filtro, filtro === item.valor && estilos.filtroAtivo]}
          >
            <Text style={[estilos.filtroTexto, filtro === item.valor && estilos.filtroTextoAtivo]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {historico.carregando ? (
          <Loading />
        ) : historico.erro ? (
          <ErrorState mensagem={historico.erro} onTentarNovamente={historico.recarregar} />
        ) : itens.length === 0 ? (
          <EmptyState
            icone="calendar"
            titulo="Nenhuma viagem concluída"
            descricao="Quando uma carona terminar, ela aparece aqui com o valor e a avaliação."
            acao="Buscar carona"
            onAcao={() => navegar('find-ride')}
          />
        ) : (
          itens.map((item) => {
            const oferecida = item.tipo === 'oferecida';

            return (
              <View key={item.id} style={estilos.card}>
                <View style={estilos.cardTopo}>
                  <View style={estilos.pessoa}>
                    <Avatar
                      nome={oferecida ? 'Você' : item.motorista.nome}
                      tamanho={40}
                      cor={oferecida ? colors.orange : colors.navy}
                    />
                    <View style={estilos.flex}>
                      <Text style={estilos.pessoaNome} numberOfLines={1}>
                        {oferecida ? 'Você' : item.motorista.nome}
                      </Text>
                      <Text style={estilos.pessoaDetalhe}>
                        {oferecida ? `${item.passageiros} passageiro(s)` : 'Motorista'}
                      </Text>
                    </View>
                  </View>

                  <Badge cor={oferecida ? colors.orange : colors.navy}>
                    {oferecida ? 'Oferecida' : 'Recebida'}
                  </Badge>
                </View>

                <View style={estilos.trajeto}>
                  <View style={estilos.ponto} />
                  <Text style={estilos.trajetoTexto} numberOfLines={1}>
                    {item.origem}
                  </Text>
                  <View style={estilos.traco} />
                  <Icon name="map-pin" size={14} color={colors.navy} />
                  <Text style={estilos.trajetoTexto} numberOfLines={1}>
                    {item.destino}
                  </Text>
                </View>

                <View style={estilos.cardRodape}>
                  <View style={estilos.data}>
                    <Icon name="calendar" size={12} color={colors.mutedForeground} />
                    <Text style={estilos.dataTexto}>{formatarData(item.data)}</Text>
                  </View>
                  <Text style={[estilos.valor, { color: oferecida ? colors.orange : colors.navy }]}>
                    {oferecida ? '+' : '-'}
                    {formatarMoeda(item.valor)}
                  </Text>
                </View>

                {!item.jaAvaliou ? (
                  <Button
                    label="Avaliar esta viagem"
                    variante="contorno"
                    icone="star-outline"
                    onPress={() => navegar('rating', { viagemId: item.viagemId })}
                    style={estilos.botaoAvaliar}
                  />
                ) : null}
              </View>
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

  resumo: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },

  filtros: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  filtro: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtroAtivo: { backgroundColor: colors.navy, borderColor: colors.navy },
  filtroTexto: { ...typography.smallMedium, color: colors.navy },
  filtroTextoAtivo: { color: colors.white },

  conteudo: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pessoa: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  pessoaNome: { ...typography.smallMedium, color: colors.navy },
  pessoaDetalhe: { ...typography.caption, color: colors.mutedForeground },

  trajeto: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ponto: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange },
  traco: { width: 24, height: 1, backgroundColor: colors.border, marginHorizontal: spacing.sm },
  trajetoTexto: { ...typography.small, color: colors.mutedForeground, flexShrink: 1 },

  cardRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  data: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dataTexto: { ...typography.caption, color: colors.mutedForeground },
  valor: { ...typography.smallMedium },

  botaoAvaliar: { minHeight: 42 },
});
