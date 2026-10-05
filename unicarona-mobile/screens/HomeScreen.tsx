import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Avatar, Card, EmptyState, Loading, SectionTitle } from '../components/ui';
import { Icon, NomeIcone } from '../components/Icon';
import { CaronaCard } from './CaronaCard';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarMoeda, primeiroNome } from '../lib/format';
import { caronaService, notificacaoService, usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import type { Carona } from '../lib/tipos';
import { useNavigation } from '../state/NavigationContext';
import { useAuth } from '../state/AuthContext';

export function HomeScreen() {
  const { navegar } = useNavigation();
  const { usuario } = useAuth();
  const { width } = useWindowDimensions();

  // Largura de cada card do carrossel (50% da tela). Aumente ou diminua o 0.50 para ajustar.
  const larguraCard = Math.round(width * 0.50);

  const painel = useCarregar(async () => {
    const [minhas, estatisticas, sugestoes, notificacoes] = await Promise.all([
      caronaService.minhas(),
      usuarioService.estatisticas(),
      caronaService.buscar({}),
      notificacaoService.naoLidas(),
    ]);
    return { minhas, estatisticas, sugestoes, naoLidas: notificacoes.total };
  }, []);

  const proximas = painel.dados
    ? [...painel.dados.minhas.reservadas, ...painel.dados.minhas.oferecidas].slice(0, 3)
    : [];

  const abrirCarona = (caronaId: string) => navegar('ride-details', { caronaId });

  return (
    <ScrollView
      style={estilos.tela}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={painel.carregando} onRefresh={painel.recarregar} tintColor={colors.orange} />
      }
    >
      <View style={estilos.cabecalho}>
        <View style={estilos.cabecalhoLinha}>
          <Pressable onPress={() => navegar('profile')} style={estilos.cabecalhoUsuario}>
            <Avatar nome={usuario?.nome} tamanho={46} />
            <View>
              <Text style={estilos.saudacaoLabel}>Olá,</Text>
              <Text style={estilos.saudacaoNome}>{primeiroNome(usuario?.nome) || 'estudante'}</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => navegar('notifications')} hitSlop={8} style={estilos.sino}>
            <Icon name="bell" size={22} color={colors.white} />
            {painel.dados && painel.dados.naoLidas > 0 ? <View style={estilos.pontoAviso} /> : null}
          </Pressable>
        </View>

        <Pressable style={estilos.busca} onPress={() => navegar('find-ride')}>
          <Icon name="search" size={19} color={colors.mutedForeground} />
          <Text style={estilos.buscaTexto}>Para onde você vai?</Text>
        </Pressable>
      </View>

      <View style={estilos.corpo}>
        {painel.dados && painel.dados.sugestoes.length > 0 ? (
          <CarrosselLoop
            caronas={painel.dados.sugestoes}
            larguraCard={larguraCard}
            onAbrir={abrirCarona}
          />
        ) : null}

        <View style={estilos.acoes}>
          <AcaoRapida
            titulo="Buscar carona"
            icone="map-pin"
            cor={colors.orange}
            onPress={() => navegar('find-ride')}
          />
          <AcaoRapida
            titulo="Oferecer carona"
            icone="users"
            cor={colors.navy}
            onPress={() => navegar('offer-ride')}
          />
        </View>

        <View style={estilos.atalhos}>
          <Atalho titulo="Agendar" icone="calendar" onPress={() => navegar('schedule-ride')} />
          <Atalho titulo="Grupos" icone="users" onPress={() => navegar('group-ride')} />
          <Atalho titulo="Mapa" icone="map-pin" onPress={() => navegar('campus-map')} />
          <Atalho titulo="Emergência" icone="shield" cor={colors.destructive} onPress={() => navegar('emergency')} />
        </View>

        {painel.carregando && !painel.dados ? (
          <Loading texto="Carregando suas caronas..." />
        ) : (
          <>
            {painel.dados ? (
              <View style={estilos.estatisticas}>
                <MiniEstatistica
                  valor={String(painel.dados.estatisticas.totalViagens)}
                  label="Viagens"
                  icone="trending-up"
                  cor={colors.orange}
                />
                <MiniEstatistica
                  valor={formatarMoeda(painel.dados.estatisticas.totalGanho)}
                  label="Recebido"
                  icone="dollar-sign"
                  cor={colors.navy}
                />
                <MiniEstatistica
                  valor={`${painel.dados.estatisticas.co2EvitadoKg} kg`}
                  label="CO₂ evitado"
                  icone="leaf"
                  cor={colors.success}
                />
              </View>
            ) : null}

            <View style={estilos.secao}>
              <SectionTitle acao="Ver todas" onAcao={() => navegar('history')}>
                Suas próximas caronas
              </SectionTitle>

              {proximas.length === 0 ? (
                <Card>
                  <EmptyState
                    icone="calendar"
                    titulo="Nenhuma carona marcada"
                    descricao="Busque uma carona para o campus ou ofereça a sua."
                    acao="Buscar carona"
                    onAcao={() => navegar('find-ride')}
                  />
                </Card>
              ) : (
                <View style={estilos.lista}>
                  {proximas.map((carona) => (
                    <CaronaCard
                      key={carona.id}
                      carona={carona}
                      compacto
                      onPress={() => abrirCarona(carona.id)}
                    />
                  ))}
                </View>
              )}
            </View>

            {painel.dados && painel.dados.sugestoes.length > 0 ? (
              <View style={estilos.secao}>
                <SectionTitle acao="Ver mais" onAcao={() => navegar('find-ride')}>
                  Caronas disponíveis agora
                </SectionTitle>
                <View style={estilos.lista}>
                  {painel.dados.sugestoes.slice(0, 3).map((carona) => (
                    <CaronaCard
                      key={carona.id}
                      carona={carona}
                      compacto
                      onPress={() => abrirCarona(carona.id)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Carrossel contínuo: os cards correm devagar para a esquerda, sem parar em cada
 * um, e o conjunto se repete para o loop não ter emenda. Cada card é clicável e
 * abre os detalhes da carona. Com uma carona só, fica parado.
 */
function CarrosselLoop({
  caronas,
  larguraCard,
  onAbrir,
}: {
  caronas: Carona[];
  larguraCard: number;
  onAbrir: (caronaId: string) => void;
}) {
  const deslocamento = useRef(new Animated.Value(0)).current;
  const [larguraConjunto, setLarguraConjunto] = useState(0);
  const animar = caronas.length > 1;

  useEffect(() => {
    if (!animar || larguraConjunto === 0) return;

    deslocamento.setValue(0);
    const animacao = Animated.loop(
      Animated.timing(deslocamento, {
        toValue: 1,
        duration: larguraConjunto * 25, // ~40px por segundo
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [animar, deslocamento, larguraConjunto]);

  const translateX = deslocamento.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -larguraConjunto],
  });

  const renderConjunto = (sufixo: string, medir: boolean) => (
    <View
      key={sufixo}
      style={estilos.carrosselConjunto}
      onLayout={medir ? (e) => setLarguraConjunto(e.nativeEvent.layout.width) : undefined}
    >
      {caronas.map((carona) => (
        <View key={`${sufixo}-${carona.id}`} style={{ width: larguraCard }}>
          <CaronaCard carona={carona} compacto onPress={() => onAbrir(carona.id)} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={estilos.carrosselFora}>
      <Animated.View
        style={[estilos.carrosselTrilha, animar && { transform: [{ translateX }] }]}
      >
        {animar ? [renderConjunto('a', true), renderConjunto('b', false)] : renderConjunto('a', false)}
      </Animated.View>
    </View>
  );
}

function AcaoRapida({
  titulo,
  icone,
  cor,
  onPress,
}: {
  titulo: string;
  icone: NomeIcone;
  cor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.acao, { backgroundColor: cor }, pressed && { opacity: 0.88 }]}
    >
      <Icon name={icone} size={24} color={colors.white} />
      <Text style={estilos.acaoTexto}>{titulo}</Text>
    </Pressable>
  );
}

function Atalho({
  titulo,
  icone,
  cor = colors.navy,
  onPress,
}: {
  titulo: string;
  icone: NomeIcone;
  cor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={estilos.atalho}>
      <View style={[estilos.atalhoIcone, { backgroundColor: `${cor}1A` }]}>
        <Icon name={icone} size={19} color={cor} />
      </View>
      <Text style={estilos.atalhoTexto}>{titulo}</Text>
    </Pressable>
  );
}

function MiniEstatistica({
  valor,
  label,
  icone,
  cor,
}: {
  valor: string;
  label: string;
  icone: NomeIcone;
  cor: string;
}) {
  return (
    <View style={estilos.mini}>
      <Icon name={icone} size={17} color={cor} />
      <Text style={estilos.miniValor} numberOfLines={1}>
        {valor}
      </Text>
      <Text style={estilos.miniLabel}>{label}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },

  cabecalho: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  cabecalhoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  cabecalhoUsuario: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sino: { padding: 4 },
  pontoAviso: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.orange,
  },
  saudacaoLabel: { ...typography.small, color: tints.onNavyText },
  saudacaoNome: { ...typography.h2, color: colors.white },

  busca: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  buscaTexto: { ...typography.small, color: colors.mutedForeground },

  corpo: { padding: spacing.xl, gap: spacing.xl },

  acoes: { flexDirection: 'row', gap: spacing.md },
  acao: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  acaoTexto: { ...typography.smallMedium, color: colors.white },

  atalhos: { flexDirection: 'row', justifyContent: 'space-between' },
  atalho: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  atalhoIcone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  atalhoTexto: { ...typography.caption, color: colors.navy, fontWeight: '600' },

  estatisticas: { flexDirection: 'row', gap: spacing.md },
  mini: {
    flex: 1,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  miniValor: { ...typography.smallMedium, color: colors.navy, marginTop: spacing.xs },
  miniLabel: { ...typography.caption, color: colors.mutedForeground },

  secao: { gap: spacing.sm },
  lista: { gap: spacing.md },

  // O carrossel vai de borda a borda da tela, mesmo dentro do `corpo` com padding.
  carrosselFora: { marginHorizontal: -spacing.xl, overflow: 'hidden' },
  carrosselTrilha: { flexDirection: 'row', width: 10000, paddingLeft: spacing.xl },
  carrosselConjunto: { flexDirection: 'row', gap: spacing.md, paddingRight: spacing.md },
});