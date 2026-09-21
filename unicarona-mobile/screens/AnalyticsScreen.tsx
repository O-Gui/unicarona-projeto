import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ErrorState, Header, Loading, SectionTitle, StarRating } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarMoeda } from '../lib/format';
import { avaliacaoService, usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useAuth } from '../state/AuthContext';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Análise de dados. Tudo vem de GET /usuarios/me/estatisticas e
 * GET /avaliacoes/resumo/:id; os gráficos são barras desenhadas com View,
 * para não trazer uma biblioteca de charts.
 */

const CATEGORIAS = [
  { chave: 'pontualidade', label: 'Pontualidade' },
  { chave: 'seguranca', label: 'Segurança' },
  { chave: 'limpeza', label: 'Limpeza' },
  { chave: 'comunicacao', label: 'Comunicação' },
];

export function AnalyticsScreen() {
  const { voltar } = useNavigation();
  const { usuario } = useAuth();

  const estatisticas = useCarregar(() => usuarioService.estatisticas(), []);
  const resumo = useCarregar(
    () => (usuario ? avaliacaoService.resumo(usuario.id) : Promise.resolve(null)),
    [usuario?.id],
  );

  if (estatisticas.carregando) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Análise de dados" onVoltar={voltar} />
        <Loading />
      </View>
    );
  }

  if (estatisticas.erro || !estatisticas.dados) {
    return (
      <View style={estilos.tela}>
        <Header titulo="Análise de dados" onVoltar={voltar} />
        <ErrorState
          mensagem={estatisticas.erro ?? 'Estatísticas indisponíveis.'}
          onTentarNovamente={estatisticas.recarregar}
        />
      </View>
    );
  }

  const dados = estatisticas.dados;
  const arvores = Math.round(dados.co2EvitadoKg / 13);
  const maiorRota = Math.max(1, ...dados.rotasFrequentes.map((rota) => rota.vezes));
  const maiorDistribuicao = Math.max(
    1,
    ...Object.values(resumo.dados?.distribuicao ?? {}).map((valor) => Number(valor)),
  );

  return (
    <View style={estilos.tela}>
      <Header titulo="Análise de dados" onVoltar={voltar}>
        <Text style={estilos.subtituloHeader}>Resumo de toda a sua atividade no UniCarona</Text>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.metricas}>
          <Metrica
            icone="trending-up"
            cor={colors.orange}
            rotulo="Total ganho"
            valor={formatarMoeda(dados.totalGanho)}
            detalhe={`${dados.caronasOferecidas} carona(s) oferecida(s)`}
          />
          <Metrica
            icone="dollar-sign"
            cor={colors.navy}
            rotulo="Total gasto"
            valor={formatarMoeda(dados.totalGasto)}
            detalhe={`${dados.caronasRecebidas} carona(s) recebida(s)`}
          />
          <Metrica
            icone="map-pin"
            cor={colors.orange}
            rotulo="Viagens concluídas"
            valor={String(dados.totalViagens)}
            detalhe={`${dados.caronasOferecidas} oferecidas • ${dados.caronasRecebidas} recebidas`}
          />
          <Metrica
            icone="leaf"
            cor={colors.success}
            rotulo="CO₂ evitado"
            valor={`${dados.co2EvitadoKg.toFixed(0)} kg`}
            detalhe={`~${arvores} árvore(s) equivalentes`}
          />
        </View>

        <Card style={estilos.bloco}>
          <SectionTitle>Rotas mais frequentes</SectionTitle>

          {dados.rotasFrequentes.length === 0 ? (
            <Text style={estilos.vazio}>Você ainda não concluiu viagens suficientes.</Text>
          ) : (
            dados.rotasFrequentes.map((rota) => (
              <View key={rota.rota} style={estilos.linhaRota}>
                <View style={estilos.rotaTopo}>
                  <Text style={estilos.rotaNome} numberOfLines={1}>
                    {rota.rota}
                  </Text>
                  <Text style={estilos.rotaVezes}>{rota.vezes}x</Text>
                </View>
                <View style={estilos.barraFundo}>
                  <View
                    style={[estilos.barraPreenchida, { width: `${(rota.vezes / maiorRota) * 100}%` }]}
                  />
                </View>
              </View>
            ))
          )}
        </Card>

        <Card style={estilos.bloco}>
          <SectionTitle>Como avaliam você</SectionTitle>

          {resumo.carregando ? (
            <Loading texto="Carregando avaliações..." />
          ) : !resumo.dados || resumo.dados.total === 0 ? (
            <Text style={estilos.vazio}>Você ainda não recebeu avaliações.</Text>
          ) : (
            <>
              <View style={estilos.mediaLinha}>
                <Text style={estilos.mediaValor}>{resumo.dados.media.toFixed(1)}</Text>
                <View>
                  <StarRating nota={resumo.dados.media} tamanho={16} mostrarNumero={false} />
                  <Text style={estilos.mediaTotal}>{resumo.dados.total} avaliação(ões)</Text>
                </View>
              </View>

              {[5, 4, 3, 2, 1].map((nota) => {
                const quantidade = Number(resumo.dados!.distribuicao?.[String(nota)] ?? 0);
                return (
                  <View key={nota} style={estilos.linhaDistribuicao}>
                    <Text style={estilos.notaRotulo}>{nota}★</Text>
                    <View style={estilos.barraFundo}>
                      <View
                        style={[
                          estilos.barraPreenchida,
                          { width: `${(quantidade / maiorDistribuicao) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={estilos.notaQuantidade}>{quantidade}</Text>
                  </View>
                );
              })}

              <View style={estilos.categorias}>
                {CATEGORIAS.map((categoria) => {
                  const valor = Number(resumo.dados!.categorias?.[categoria.chave] ?? 0);
                  return (
                    <View key={categoria.chave} style={estilos.categoria}>
                      <Text style={estilos.categoriaValor}>{valor > 0 ? valor.toFixed(1) : '—'}</Text>
                      <Text style={estilos.categoriaLabel}>{categoria.label}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

function Metrica({
  icone,
  cor,
  rotulo,
  valor,
  detalhe,
}: {
  icone: 'trending-up' | 'dollar-sign' | 'map-pin' | 'leaf';
  cor: string;
  rotulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <View style={estilos.metrica}>
      <View style={estilos.metricaTopo}>
        <Icon name={icone} size={18} color={cor} />
        <Text style={estilos.metricaRotulo}>{rotulo}</Text>
      </View>
      <Text style={[estilos.metricaValor, { color: cor }]}>{valor}</Text>
      <Text style={estilos.metricaDetalhe}>{detalhe}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },

  subtituloHeader: { ...typography.small, color: tints.onNavyText, marginTop: spacing.sm },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },

  metricas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metrica: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  metricaTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metricaRotulo: { ...typography.caption, color: colors.mutedForeground, flexShrink: 1 },
  metricaValor: { ...typography.h3 },
  metricaDetalhe: { ...typography.caption, color: colors.mutedForeground },

  bloco: { gap: spacing.md },
  vazio: { ...typography.small, color: colors.mutedForeground },

  linhaRota: { gap: spacing.xs },
  rotaTopo: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rotaNome: { ...typography.small, color: colors.navy, flex: 1 },
  rotaVezes: { ...typography.smallMedium, color: colors.orange },

  barraFundo: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.muted, overflow: 'hidden' },
  barraPreenchida: { height: 8, borderRadius: radius.pill, backgroundColor: colors.orange },

  mediaLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  mediaValor: { ...typography.h1, color: colors.navy },
  mediaTotal: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  linhaDistribuicao: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notaRotulo: { ...typography.caption, color: colors.mutedForeground, width: 24 },
  notaQuantidade: { ...typography.caption, color: colors.mutedForeground, width: 24, textAlign: 'right' },

  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  categoria: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
  },
  categoriaValor: { ...typography.title, color: colors.navy },
  categoriaLabel: { ...typography.caption, color: colors.mutedForeground },
});
