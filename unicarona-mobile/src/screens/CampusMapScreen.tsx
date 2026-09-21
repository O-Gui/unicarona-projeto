import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import MapView, { Marker, Region } from 'react-native-maps';

import { Header } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { colors, radius, spacing, typography } from '../../theme';
import { caronaService } from '../../lib/servicos';
import { useCarregar } from '../../lib/useCarregar';

export function CampusMapScreen() {
  const locais = useCarregar(() => caronaService.locais(), []);
  const [busca, setBusca] = useState('');
  const [localSelecionado, setLocalSelecionado] = useState<string | null>(null);

  const locaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return locais.dados ?? [];
    }

    return (locais.dados ?? []).filter(
      (local) =>
        local.nome.toLowerCase().includes(termo) ||
        local.endereco?.toLowerCase().includes(termo),
    );
  }, [busca, locais.dados]);

  const regiaoInicial: Region | undefined = useMemo(() => {
    const primeiro = locais.dados?.[0];

    if (!primeiro) return undefined;

    return {
      latitude: primeiro.lat,
      longitude: primeiro.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [locais.dados]);

  const localSelecionadoDados = locais.dados?.find(
    (local) => local.nome === localSelecionado,
  );

  const selecionarLocal = (nome: string) => {
    setLocalSelecionado(nome);
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Mapa do campus" />

      <View style={estilos.conteudo}>
        <View style={estilos.buscaContainer}>
          <Icon name="search" size={18} color={colors.mutedForeground} />

          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar local..."
            placeholderTextColor={colors.mutedForeground}
            style={estilos.busca}
          />

          {busca.length > 0 ? (
            <Pressable onPress={() => setBusca('')}>
              <Icon
                name="x"
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          ) : null}
        </View>

        {locais.carregando ? (
          <View style={estilos.estado}>
            <ActivityIndicator color={colors.orange} />
            <Text style={estilos.estadoTexto}>
              Carregando locais...
            </Text>
          </View>
        ) : locais.erro ? (
          <View style={estilos.estado}>
            <Icon
              name="map-pin"
              size={28}
              color={colors.destructive}
            />
            <Text style={estilos.estadoTexto}>
              Não foi possível carregar os locais do campus.
            </Text>
            <Pressable
              onPress={locais.recarregar}
              style={estilos.tentar}
            >
              <Text style={estilos.tentarTexto}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : regiaoInicial ? (
          <>
            <MapView
              style={estilos.mapa}
              initialRegion={regiaoInicial}
              showsUserLocation
              showsMyLocationButton
              showsCompass
              toolbarEnabled={false}
            >
              {locaisFiltrados.map((local) => (
                <Marker
                  key={`${local.nome}-${local.lat}-${local.lng}`}
                  coordinate={{
                    latitude: local.lat,
                    longitude: local.lng,
                  }}
                  title={local.nome}
                  description={local.endereco}
                  onPress={() => selecionarLocal(local.nome)}
                />
              ))}
            </MapView>

            {localSelecionadoDados ? (
              <View style={estilos.localSelecionado}>
                <View style={estilos.localIcone}>
                  <Icon
                    name="map-pin"
                    size={20}
                    color={colors.orange}
                  />
                </View>

                <View style={estilos.localInfo}>
                  <Text
                    style={estilos.localNome}
                    numberOfLines={1}
                  >
                    {localSelecionadoDados.nome}
                  </Text>

                  {localSelecionadoDados.endereco ? (
                    <Text
                      style={estilos.localEndereco}
                      numberOfLines={2}
                    >
                      {localSelecionadoDados.endereco}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => setLocalSelecionado(null)}
                  hitSlop={10}
                >
                  <Icon
                    name="x"
                    size={18}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>
            ) : null}

            <View style={estilos.listaContainer}>
              <Text style={estilos.listaTitulo}>
                Locais do campus
              </Text>

              {locaisFiltrados.length === 0 ? (
                <Text style={estilos.vazio}>
                  Nenhum local encontrado.
                </Text>
              ) : (
                locaisFiltrados.slice(0, 5).map((local) => (
                  <Pressable
                    key={`${local.nome}-lista`}
                    style={estilos.itemLocal}
                    onPress={() => selecionarLocal(local.nome)}
                  >
                    <View style={estilos.itemIcone}>
                      <Icon
                        name="map-pin"
                        size={17}
                        color={colors.orange}
                      />
                    </View>

                    <View style={estilos.itemInfo}>
                      <Text style={estilos.itemNome}>
                        {local.nome}
                      </Text>

                      {local.endereco ? (
                        <Text
                          style={estilos.itemEndereco}
                          numberOfLines={1}
                        >
                          {local.endereco}
                        </Text>
                      ) : null}
                    </View>

                    <Icon
                      name="chevron-right"
                      size={18}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                ))
              )}
            </View>
          </>
        ) : (
          <View style={estilos.estado}>
            <Icon
              name="map-pin"
              size={30}
              color={colors.mutedForeground}
            />
            <Text style={estilos.estadoTexto}>
              Nenhum local do campus disponível.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.background,
  },

  conteudo: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  buscaContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  busca: {
    flex: 1,
    ...typography.small,
    color: colors.navy,
  },

  mapa: {
    flex: 1,
    minHeight: 300,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  estadoTexto: {
    ...typography.small,
    color: colors.mutedForeground,
    textAlign: 'center',
  },

  tentar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
  },

  tentarTexto: {
    ...typography.smallMedium,
    color: colors.white,
  },

  localSelecionado: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 170,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  localIcone: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.orange,
  },

  localInfo: {
    flex: 1,
  },

  localNome: {
    ...typography.smallMedium,
    color: colors.navy,
  },

  localEndereco: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 2,
  },

  listaContainer: {
    paddingVertical: spacing.md,
  },

  listaTitulo: {
    ...typography.smallMedium,
    color: colors.navy,
    marginBottom: spacing.sm,
  },

  itemLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },

  itemIcone: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.orange,
  },

  itemInfo: {
    flex: 1,
  },

  itemNome: {
    ...typography.smallMedium,
    color: colors.navy,
  },

  itemEndereco: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: 2,
  },

  vazio: {
    ...typography.small,
    color: colors.mutedForeground,
    paddingVertical: spacing.md,
  },
});