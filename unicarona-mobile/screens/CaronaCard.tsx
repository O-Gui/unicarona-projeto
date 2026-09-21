import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, RouteLine, StarRating } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, spacing, typography } from '../theme';
import { formatarData, formatarHora, formatarMoeda } from '../lib/format';
import type { Carona } from '../lib/tipos';

/**
 * Cartão de carona reutilizado na busca, na home e nas "minhas caronas" —
 * é o bloco mais repetido do protótipo, então vive num componente só.
 */
export function CaronaCard({
  carona,
  onPress,
  onReservar,
  reservando = false,
  compacto = false,
}: {
  carona: Carona;
  onPress?: () => void;
  onReservar?: () => void;
  reservando?: boolean;
  compacto?: boolean;
}) {
  return (
    <Card onPress={onPress} style={estilos.card}>
      <View style={estilos.topo}>
        <View style={estilos.motorista}>
          <Avatar nome={carona.motorista.nome} tamanho={compacto ? 40 : 48} />
          <View style={estilos.flex}>
            <Text style={estilos.nome} numberOfLines={1}>
              {carona.motorista.nome}
            </Text>
            <View style={estilos.linhaNota}>
              <StarRating
                nota={carona.motorista.avaliacaoMedia}
                sufixo={carona.veiculo?.modelo ?? undefined}
              />
            </View>
          </View>
        </View>

        <View style={estilos.preco}>
          <Text style={estilos.precoValor}>{formatarMoeda(carona.precoPorPassageiro)}</Text>
          <Text style={estilos.precoLabel}>por pessoa</Text>
        </View>
      </View>

      {compacto ? (
        <RouteLine origem={carona.origem.nome} destino={carona.destino.nome} compacto />
      ) : (
        <RouteLine
          origem={carona.origem.nome}
          destino={carona.destino.nome}
          detalheOrigem={`${formatarData(carona.dataHoraPartida)} • ${formatarHora(carona.dataHoraPartida)}`}
          detalheDestino={carona.destino.endereco}
        />
      )}

      <View style={estilos.rodape}>
        <View style={estilos.vagas}>
          <Icon name="users" size={14} color={colors.mutedForeground} />
          <Text style={estilos.vagasTexto}>
            {carona.vagasDisponiveis} de {carona.vagasTotais} vagas
          </Text>
          {compacto ? (
            <>
              <Text style={estilos.separador}>•</Text>
              <Icon name="clock" size={13} color={colors.mutedForeground} />
              <Text style={estilos.vagasTexto}>{formatarHora(carona.dataHoraPartida)}</Text>
            </>
          ) : null}
        </View>

        {onReservar ? (
          <Button
            label="Reservar"
            onPress={onReservar}
            carregando={reservando}
            disabled={carona.vagasDisponiveis === 0}
            style={estilos.botaoReservar}
          />
        ) : null}
      </View>
    </Card>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: spacing.lg },
  topo: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  motorista: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  nome: { ...typography.bodyMedium, color: colors.navy },
  linhaNota: { marginTop: 2 },
  preco: { alignItems: 'flex-end' },
  precoValor: { ...typography.title, color: colors.orange },
  precoLabel: { ...typography.caption, color: colors.mutedForeground },

  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vagas: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  vagasTexto: { ...typography.caption, color: colors.mutedForeground },
  separador: { ...typography.caption, color: colors.border, marginHorizontal: 2 },
  botaoReservar: { minHeight: 40, paddingHorizontal: spacing.xl },
});
