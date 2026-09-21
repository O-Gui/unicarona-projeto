import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, EmptyState, Loading, SectionTitle } from '../components/ui';
import { Icon, NomeIcone } from '../components/Icon';
import { CaronaCard } from './CaronaCard';
import { colors, radius, spacing, tints, typography } from '../theme';
import { formatarMoeda, primeiroNome } from '../lib/format';
import { caronaService, notificacaoService, usuarioService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';
import { useAuth } from '../state/AuthContext';

export function HomeScreen() {
  const { navegar } = useNavigation();
  const { usuario } = useAuth();

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
          <View>
            <Text style={estilos.saudacaoLabel}>Olá,</Text>
            <Text style={estilos.saudacaoNome}>{primeiroNome(usuario?.nome) || 'estudante'}</Text>
          </View>

          <View style={estilos.cabecalhoAcoes}>
            <Pressable onPress={() => navegar('notifications')} hitSlop={8} style={estilos.sino}>
              <Icon name="bell" size={22} color={colors.white} />
              {painel.dados && painel.dados.naoLidas > 0 ? <View style={estilos.pontoAviso} /> : null}
            </Pressable>

            <Pressable onPress={() => navegar('profile')}>
              <Avatar nome={usuario?.nome} tamanho={46} />
            </Pressable>
          </View>
        </View>

        <Pressable style={estilos.busca} onPress={() => navegar('find-ride')}>
          <Icon name="search" size={19} color={colors.mutedForeground} />
          <Text style={estilos.buscaTexto}>Para onde você vai?</Text>
        </Pressable>
      </View>

      <View style={estilos.corpo}>
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
                      onPress={() => navegar('ride-details', { caronaId: carona.id })}
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
                      onPress={() => navegar('ride-details', { caronaId: carona.id })}
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
  cabecalhoAcoes: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
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
});
