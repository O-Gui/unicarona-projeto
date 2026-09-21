import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, ErrorState, Header, InfoBox, Loading, SectionTitle } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { caronaService, usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Mapa do campus. O app ainda não embarca um mapa (react-native-maps não
 * está instalado), então a tela lista os pontos que o backend conhece em
 * GET /caronas/locais e permite partir deles para a busca.
 */
export function CampusMapScreen() {
  const { voltar, navegar } = useNavigation();
  const [busca, setBusca] = useState('');

  const locais = useCarregar(() => caronaService.locais(), []);
  const estatisticas = useCarregar(() => usuarioService.estatisticas(), []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const todos = locais.dados ?? [];
    if (!termo) return todos;
    return todos.filter((local) => local.nome.toLowerCase().includes(termo));
  }, [locais.dados, busca]);

  return (
    <View style={estilos.tela}>
      <Header titulo="Mapa do campus" onVoltar={voltar}>
        <View style={estilos.busca}>
          <Icon name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            placeholder="Buscar um ponto de encontro..."
            placeholderTextColor="#A9B6C2"
            value={busca}
            onChangeText={setBusca}
            style={estilos.entradaBusca}
          />
        </View>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.bloco}>
          <SectionTitle>Pontos cadastrados</SectionTitle>

          {locais.carregando ? (
            <Loading />
          ) : locais.erro ? (
            <ErrorState mensagem={locais.erro} onTentarNovamente={locais.recarregar} />
          ) : filtrados.length === 0 ? (
            <Card>
              <Text style={estilos.vazio}>Nenhum ponto com esse nome.</Text>
            </Card>
          ) : (
            filtrados.map((local) => (
              <Card
                key={local.nome}
                style={estilos.local}
                onPress={() => navegar('find-ride', { filtros: { destino: local.nome } })}
              >
                <View style={estilos.bolha}>
                  <Icon name="map-pin" size={18} color={colors.orange} />
                </View>
                <View style={estilos.flex}>
                  <Text style={estilos.localNome}>{local.nome}</Text>
                  {local.endereco ? (
                    <Text style={estilos.localEndereco} numberOfLines={1}>
                      {local.endereco}
                    </Text>
                  ) : null}
                  <Text style={estilos.coordenadas}>
                    {local.lat.toFixed(4)}, {local.lng.toFixed(4)}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
              </Card>
            ))
          )}
        </View>

        <View style={estilos.bloco}>
          <SectionTitle acao="Ver estatísticas" onAcao={() => navegar('analytics')}>
            Suas rotas frequentes
          </SectionTitle>

          {(estatisticas.dados?.rotasFrequentes.length ?? 0) === 0 ? (
            <Card>
              <Text style={estilos.vazio}>
                Depois de algumas viagens, suas rotas mais usadas aparecem aqui.
              </Text>
            </Card>
          ) : (
            estatisticas.dados!.rotasFrequentes.map((rota) => (
              <Pressable
                key={rota.rota}
                onPress={() => navegar('find-ride')}
                style={({ pressed }) => [estilos.rota, pressed && estilos.pressionado]}
              >
                <Icon name="refresh" size={18} color={colors.navy} />
                <View style={estilos.flex}>
                  <Text style={estilos.rotaNome} numberOfLines={1}>
                    {rota.rota}
                  </Text>
                  <Text style={estilos.rotaVezes}>{rota.vezes} viagem(ns)</Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))
          )}
        </View>

        <InfoBox icone="map-pin">
          Os pontos vêm do catálogo do servidor e são o que o app usa para calcular distâncias. Se
          faltar algum local, ele pode ser adicionado em `common/locais.ts` no backend.
        </InfoBox>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pressionado: { opacity: 0.85 },

  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  entradaBusca: { flex: 1, ...typography.body, color: colors.navy, paddingVertical: spacing.md },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  bloco: { gap: spacing.md },
  vazio: { ...typography.small, color: colors.mutedForeground },

  local: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bolha: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 140, 24, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localNome: { ...typography.smallMedium, color: colors.navy },
  localEndereco: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },
  coordenadas: { ...typography.caption, color: colors.border, marginTop: 2 },

  rota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  rotaNome: { ...typography.smallMedium, color: colors.navy },
  rotaVezes: { ...typography.caption, color: colors.mutedForeground },
});
