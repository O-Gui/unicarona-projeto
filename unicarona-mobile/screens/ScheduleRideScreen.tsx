import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Header,
  Loading,
  RouteLine,
  SectionTitle,
  StatCard,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarData, formatarHora, formatarMoeda } from '../lib/format';
import { caronaService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';
import type { Carona, StatusCarona } from '../lib/tipos';

/**
 * UC — Caronas programadas. Mostra o que você já publicou (GET /caronas/minhas)
 * e permite cancelar ou concluir. A recorrência semanal do protótipo não existe
 * no backend: cada carona é publicada para uma data.
 */

const CORES_STATUS: Record<StatusCarona, string> = {
  ABERTA: colors.success,
  LOTADA: colors.orange,
  CANCELADA: colors.destructive,
  CONCLUIDA: colors.navy,
};

export function ScheduleRideScreen() {
  const { voltar, navegar } = useNavigation();
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const minhas = useCarregar(() => caronaService.minhas(), []);

  const oferecidas = minhas.dados?.oferecidas ?? [];
  const reservadas = minhas.dados?.reservadas ?? [];
  const ativas = oferecidas.filter(
    (carona) => carona.status === 'ABERTA' || carona.status === 'LOTADA',
  );

  const cancelar = (carona: Carona) => {
    Alert.alert('Cancelar carona', 'Os passageiros confirmados serão avisados. Continuar?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar carona',
        style: 'destructive',
        onPress: async () => {
          setProcessandoId(carona.id);
          try {
            await caronaService.cancelar(carona.id);
            await minhas.recarregar();
          } catch (falha) {
            Alert.alert(
              'Não foi possível cancelar',
              falha instanceof Error ? falha.message : 'Tente novamente.',
            );
          } finally {
            setProcessandoId(null);
          }
        },
      },
    ]);
  };

  const concluir = async (carona: Carona) => {
    setProcessandoId(carona.id);
    try {
      const viagem = await caronaService.concluir(carona.id);
      await minhas.recarregar();
      navegar('rating', { viagemId: viagem.id });
    } catch (falha) {
      Alert.alert(
        'Não foi possível concluir',
        falha instanceof Error ? falha.message : 'Tente novamente.',
      );
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Caronas programadas" onVoltar={voltar}>
        <Text style={estilos.subtitulo}>
          Tudo que você publicou e as vagas que já reservou com outras pessoas.
        </Text>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.estatisticas}>
          <StatCard valor={ativas.length} label="Ativas" icone="calendar" />
          <StatCard valor={reservadas.length} label="Reservadas" icone="users" cor={colors.navy} />
          <StatCard valor={oferecidas.length} label="Publicadas" icone="car" />
        </View>

        <Button
          label="Publicar nova carona"
          variante="secundario"
          icone="car"
          onPress={() => navegar('offer-ride')}
        />

        <View style={estilos.bloco}>
          <SectionTitle>Você oferece</SectionTitle>

          {minhas.carregando ? (
            <Loading />
          ) : minhas.erro ? (
            <ErrorState mensagem={minhas.erro} onTentarNovamente={minhas.recarregar} />
          ) : oferecidas.length === 0 ? (
            <EmptyState
              icone="car"
              titulo="Nenhuma carona publicada"
              descricao="Ofereça uma vaga no seu trajeto e divida os custos."
              acao="Oferecer carona"
              onAcao={() => navegar('offer-ride')}
            />
          ) : (
            oferecidas.map((carona) => (
              <Card key={carona.id} style={estilos.cartao}>
                <View style={estilos.cartaoTopo}>
                  <View style={estilos.quando}>
                    <Icon name="calendar" size={14} color={colors.mutedForeground} />
                    <Text style={estilos.quandoTexto}>
                      {formatarData(carona.dataHoraPartida)} • {formatarHora(carona.dataHoraPartida)}
                    </Text>
                  </View>
                  <Badge cor={CORES_STATUS[carona.status]}>{carona.status}</Badge>
                </View>

                <RouteLine origem={carona.origem.nome} destino={carona.destino.nome} compacto />

                <View style={estilos.cartaoRodape}>
                  <Text style={estilos.detalhe}>
                    {carona.vagasDisponiveis} de {carona.vagasTotais} vagas livres
                  </Text>
                  <Text style={estilos.preco}>{formatarMoeda(carona.precoPorPassageiro)}</Text>
                </View>

                <View style={estilos.acoes}>
                  <Button
                    label="Detalhes"
                    variante="contorno"
                    onPress={() => navegar('ride-details', { caronaId: carona.id })}
                    style={estilos.flex}
                  />
                  {carona.status === 'ABERTA' || carona.status === 'LOTADA' ? (
                    <>
                      <Button
                        label="Concluir"
                        onPress={() => concluir(carona)}
                        carregando={processandoId === carona.id}
                        style={estilos.flex}
                      />
                      <Button
                        label="Cancelar"
                        variante="perigo"
                        onPress={() => cancelar(carona)}
                        style={estilos.flex}
                      />
                    </>
                  ) : null}
                </View>
              </Card>
            ))
          )}
        </View>

        {reservadas.length > 0 ? (
          <View style={estilos.bloco}>
            <SectionTitle>Você reservou</SectionTitle>

            {reservadas.map((carona) => (
              <Card
                key={carona.id}
                style={estilos.cartao}
                onPress={() => navegar('ride-details', { caronaId: carona.id })}
              >
                <View style={estilos.cartaoTopo}>
                  <View style={estilos.quando}>
                    <Icon name="clock" size={14} color={colors.mutedForeground} />
                    <Text style={estilos.quandoTexto}>
                      {formatarData(carona.dataHoraPartida)} • {formatarHora(carona.dataHoraPartida)}
                    </Text>
                  </View>
                  <Badge cor={colors.navy}>{carona.motorista.nome}</Badge>
                </View>

                <RouteLine origem={carona.origem.nome} destino={carona.destino.nome} compacto />

                <Text style={estilos.preco}>{formatarMoeda(carona.precoPorPassageiro)}</Text>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  subtitulo: { ...typography.small, color: tints.onNavyText, marginTop: spacing.sm },
  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  estatisticas: { flexDirection: 'row', gap: spacing.md },

  bloco: { gap: spacing.md },
  cartao: { gap: spacing.md },
  cartaoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  quando: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  quandoTexto: { ...typography.caption, color: colors.mutedForeground },

  cartaoRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detalhe: { ...typography.caption, color: colors.mutedForeground },
  preco: { ...typography.smallMedium, color: colors.orange },

  acoes: { flexDirection: 'row', gap: spacing.sm },
});
