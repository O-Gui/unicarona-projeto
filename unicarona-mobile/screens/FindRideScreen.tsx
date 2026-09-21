import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, EmptyState, ErrorState, Header, Loading } from '../components/ui';
import { Icon } from '../components/Icon';
import { CaronaCard } from './CaronaCard';
import { colors, radius, spacing, typography } from '../theme';
import { mascaras } from '../lib/format';
import { caronaService, solicitacaoService, type FiltrosBusca } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

export function FindRideScreen() {
  const { atual, voltar, navegar } = useNavigation();

  // A busca avançada devolve os filtros por parâmetro de navegação.
  const filtrosIniciais: FiltrosBusca = atual.params?.filtros ?? {};

  const [origem, setOrigem] = useState(filtrosIniciais.origem ?? '');
  const [destino, setDestino] = useState(filtrosIniciais.destino ?? '');
  const [data, setData] = useState('');
  const [filtros, setFiltros] = useState<FiltrosBusca>(filtrosIniciais);
  const [reservandoId, setReservandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const busca = useCarregar(() => caronaService.buscar(filtros), [JSON.stringify(filtros)]);

  const aplicar = () => {
    setAviso(null);
    setFiltros((anteriores) => ({
      ...anteriores,
      origem: origem.trim() || undefined,
      destino: destino.trim() || undefined,
      data: converterData(data),
    }));
  };

  const reservar = async (caronaId: string) => {
    setReservandoId(caronaId);
    setAviso(null);

    try {
      await solicitacaoService.criar(caronaId);
      setAviso('Solicitação enviada. O motorista vai confirmar sua vaga.');
      await busca.recarregar();
    } catch (falha) {
      setAviso(falha instanceof Error ? falha.message : 'Não foi possível reservar.');
    } finally {
      setReservandoId(null);
    }
  };

  const quantidade = busca.dados?.length ?? 0;
  const filtrosAtivos = contarFiltros(filtros);

  return (
    <View style={estilos.tela}>
      <Header titulo="Buscar carona" onVoltar={voltar}>
        <View style={estilos.formulario}>
          <View style={estilos.campoClaro}>
            <View style={estilos.marcador} />
            <TextInput
              placeholder="De onde você sai?"
              placeholderTextColor="#A9B6C2"
              value={origem}
              onChangeText={setOrigem}
              style={estilos.entradaClara}
            />
          </View>

          <View style={estilos.campoClaro}>
            <Icon name="map-pin" size={16} color={colors.navy} />
            <TextInput
              placeholder="Para onde você vai?"
              placeholderTextColor="#A9B6C2"
              value={destino}
              onChangeText={setDestino}
              style={estilos.entradaClara}
            />
          </View>

          <View style={estilos.linhaDupla}>
            <View style={[estilos.campoClaro, estilos.flex]}>
              <Icon name="calendar" size={16} color={colors.mutedForeground} />
              <TextInput
                placeholder="dd/mm/aaaa"
                placeholderTextColor="#A9B6C2"
                value={data}
                onChangeText={(valor) => setData(mascaras.data(valor))}
                keyboardType="numeric"
                style={estilos.entradaClara}
              />
            </View>

            <Button label="Buscar" variante="secundario" onPress={aplicar} style={estilos.botaoBuscar} />
          </View>
        </View>
      </Header>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.resultadoTopo}>
          <Text style={estilos.resultadoTexto}>
            {busca.carregando ? 'Buscando...' : `${quantidade} carona(s) encontrada(s)`}
          </Text>

          <Pressable
            style={estilos.botaoFiltros}
            onPress={() => navegar('advanced-search', { filtros })}
          >
            <Icon name="sliders" size={16} color={colors.navy} />
            <Text style={estilos.botaoFiltrosTexto}>
              Filtros{filtrosAtivos > 0 ? ` (${filtrosAtivos})` : ''}
            </Text>
          </Pressable>
        </View>

        {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}

        {busca.carregando ? (
          <Loading texto="Procurando caronas..." />
        ) : busca.erro ? (
          <ErrorState mensagem={busca.erro} onTentarNovamente={busca.recarregar} />
        ) : quantidade === 0 ? (
          <EmptyState
            icone="search"
            titulo="Nenhuma carona para esse trajeto"
            descricao="Tente ampliar a data ou remover alguns filtros. Você também pode oferecer a sua."
            acao="Oferecer carona"
            onAcao={() => navegar('offer-ride')}
          />
        ) : (
          <View style={estilos.lista}>
            {busca.dados!.map((carona) => (
              <CaronaCard
                key={carona.id}
                carona={carona}
                onPress={() => navegar('ride-details', { caronaId: carona.id })}
                onReservar={() => reservar(carona.id)}
                reservando={reservandoId === carona.id}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/** "01/05/2026" (digitado) → "2026-05-01" (esperado pela API). */
function converterData(valor: string): string | undefined {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return undefined;
  const [dia, mes, ano] = valor.split('/');
  return `${ano}-${mes}-${dia}`;
}

function contarFiltros(filtros: FiltrosBusca): number {
  const chaves: (keyof FiltrosBusca)[] = [
    'precoMin',
    'precoMax',
    'horaInicio',
    'horaFim',
    'vagasMinimas',
    'notaMinima',
    'apenasVerificados',
  ];
  let total = chaves.filter((chave) => filtros[chave] !== undefined).length;
  if (filtros.preferencias?.length) total += 1;
  return total;
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  formulario: { gap: spacing.md, marginTop: spacing.lg },
  campoClaro: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  marcador: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },
  entradaClara: { flex: 1, ...typography.body, color: colors.navy, paddingVertical: spacing.md },
  linhaDupla: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  botaoBuscar: { minHeight: 46, paddingHorizontal: spacing.xl },

  conteudo: { padding: spacing.xl, gap: spacing.lg },
  resultadoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultadoTexto: { ...typography.small, color: colors.mutedForeground },
  botaoFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  botaoFiltrosTexto: { ...typography.smallMedium, color: colors.navy },

  aviso: { ...typography.small, color: colors.navy, backgroundColor: colors.muted, padding: spacing.md, borderRadius: radius.sm },
  lista: { gap: spacing.lg },
});
