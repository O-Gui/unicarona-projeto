import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, ErrorState, Header, InfoBox, Loading, SectionTitle } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarData, formatarMoeda } from '../lib/format';
import { caronaService, usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Carteira. O saldo e o extrato são calculados a partir das viagens já
 * concluídas (GET /caronas/historico) e das estatísticas do usuário. Não há
 * processamento financeiro no backend: adicionar e sacar seguem como telas
 * de intenção, conforme o protótipo.
 */
export function WalletScreen() {
  const { voltar, navegar } = useNavigation();

  const estatisticas = useCarregar(() => usuarioService.estatisticas(), []);
  const historico = useCarregar(() => caronaService.historico(), []);

  const saldo = (estatisticas.dados?.totalGanho ?? 0) - (estatisticas.dados?.totalGasto ?? 0);
  const transacoes = historico.dados ?? [];

  return (
    <View style={estilos.tela}>
      <Header titulo="Carteira UniCarona" onVoltar={voltar}>
        <View style={estilos.cartaoSaldo}>
          <View style={estilos.linhaRotulo}>
            <Icon name="dollar-sign" size={18} color={colors.white} />
            <Text style={estilos.rotuloSaldo}>Saldo acumulado</Text>
          </View>
          <Text style={estilos.saldo}>
            {estatisticas.carregando ? '—' : formatarMoeda(saldo)}
          </Text>

          <View style={estilos.acoes}>
            <Button
              label="Métodos"
              variante="secundario"
              icone="credit-card"
              onPress={() => navegar('payment-methods')}
              style={estilos.flex}
            />
            <Button
              label="Ver extrato"
              variante="contorno"
              icone="calendar"
              onPress={() => navegar('history')}
              style={estilos.flex}
            />
          </View>
        </View>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.resumo}>
          <View style={estilos.cartaoResumo}>
            <View style={estilos.linhaRotuloEscuro}>
              <Icon name="trending-up" size={16} color={colors.orange} />
              <Text style={estilos.resumoRotulo}>Ganhos</Text>
            </View>
            <Text style={[estilos.resumoValor, { color: colors.orange }]}>
              +{formatarMoeda(estatisticas.dados?.totalGanho ?? 0)}
            </Text>
          </View>

          <View style={estilos.cartaoResumo}>
            <View style={estilos.linhaRotuloEscuro}>
              <Icon name="dollar-sign" size={16} color={colors.navy} />
              <Text style={estilos.resumoRotulo}>Gastos</Text>
            </View>
            <Text style={[estilos.resumoValor, { color: colors.navy }]}>
              -{formatarMoeda(estatisticas.dados?.totalGasto ?? 0)}
            </Text>
          </View>
        </View>

        <View style={estilos.bloco}>
          <SectionTitle acao="Ver todas" onAcao={() => navegar('history')}>
            Transações recentes
          </SectionTitle>

          {historico.carregando ? (
            <Loading />
          ) : historico.erro ? (
            <ErrorState mensagem={historico.erro} onTentarNovamente={historico.recarregar} />
          ) : transacoes.length === 0 ? (
            <EmptyState
              icone="dollar-sign"
              titulo="Sem movimentações"
              descricao="Assim que uma carona for concluída, o valor aparece aqui."
            />
          ) : (
            transacoes.slice(0, 8).map((item) => {
              const ganho = item.tipo === 'oferecida';

              return (
                <View key={item.id} style={estilos.transacao}>
                  <View
                    style={[
                      estilos.bolha,
                      { backgroundColor: ganho ? tints.orange : tints.navy },
                    ]}
                  >
                    <Icon
                      name={ganho ? 'trending-up' : 'car'}
                      size={18}
                      color={ganho ? colors.orange : colors.navy}
                    />
                  </View>

                  <View style={estilos.flex}>
                    <Text style={estilos.transacaoTitulo} numberOfLines={1}>
                      {item.origem} → {item.destino}
                    </Text>
                    <Text style={estilos.transacaoData}>
                      {formatarData(item.concluidaEm)} •{' '}
                      {ganho ? `${item.passageiros} passageiro(s)` : item.motorista.nome}
                    </Text>
                  </View>

                  <Text style={[estilos.transacaoValor, { color: ganho ? colors.orange : colors.navy }]}>
                    {ganho ? '+' : '-'}
                    {formatarMoeda(item.valor)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <InfoBox icone="credit-card">
          Os valores são acertados diretamente entre motorista e passageiros. A carteira serve para
          acompanhar quanto você já ganhou e gastou com caronas.
        </InfoBox>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  cartaoSaldo: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: tints.onNavy,
    gap: spacing.md,
  },
  linhaRotulo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rotuloSaldo: { ...typography.small, color: tints.onNavyText },
  saldo: { ...typography.h1, color: colors.white },
  acoes: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  resumo: { flexDirection: 'row', gap: spacing.md },
  cartaoResumo: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  linhaRotuloEscuro: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resumoRotulo: { ...typography.caption, color: colors.mutedForeground },
  resumoValor: { ...typography.h3 },

  bloco: { gap: spacing.md },
  transacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  bolha: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  transacaoTitulo: { ...typography.smallMedium, color: colors.navy },
  transacaoData: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },
  transacaoValor: { ...typography.smallMedium },
});
