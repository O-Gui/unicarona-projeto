import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  Field,
  Header,
  InfoBox,
  OptionRow,
  TextArea,
} from '../components/ui';
import { colors, spacing, typography } from '../theme';
import { mascaras, paraIso } from '../lib/format';
import { caronaService, veiculoService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';
import { obterLocalizacaoAtual } from '../lib/localizacao';

const PREFERENCIAS = ['Aceita bagagem', 'Permite música', 'Aceita pets', 'Não fumantes'];

export function OfferRideScreen() {
  const { voltar, navegar } = useNavigation();
  const veiculo = useCarregar(() => veiculoService.principal());

  const [origem, setOrigem] = useState('');
  const [origemLat, setOrigemLat] = useState<number | undefined>();
  const [origemLng, setOrigemLng] = useState<number | undefined>();
  const [localizando, setLocalizando] = useState(false);
  const [destino, setDestino] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [vagas, setVagas] = useState<number>(2);
  const [preco, setPreco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [preferencias, setPreferencias] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const alternarPreferencia = (item: string) => {
    setPreferencias((atual) =>
      atual.includes(item) ? atual.filter((valor) => valor !== item) : [...atual, item],
    );
  };

  const usarMinhaLocalizacao = async () => {
    setLocalizando(true);
    setErros((atual) => ({ ...atual, origem: '' }));

    try {
      const localizacao = await obterLocalizacaoAtual();

      setOrigemLat(localizacao.latitude);
      setOrigemLng(localizacao.longitude);

      setOrigem('Minha localização atual');
    } catch (falha) {
      setErros((atual) => ({
        ...atual,
        origem:
          falha instanceof Error
            ? falha.message
            : 'Não foi possível obter sua localização.',
      }));
    } finally {
      setLocalizando(false);
    }
  };

  const publicar = async () => {
    const encontrados: Record<string, string> = {};
    const partida = paraIso(data, hora);
    const precoNumerico = Number(preco.replace(',', '.'));

    if (!origem.trim()) encontrados.origem = 'Informe de onde você sai.';
    if (!destino.trim()) encontrados.destino = 'Informe para onde você vai.';
    if (!partida) encontrados.data = 'Informe data e hora válidas.';
    else if (new Date(partida).getTime() < Date.now()) {
      encontrados.data = 'A partida precisa ser em um horário futuro.';
    }
    if (!preco || Number.isNaN(precoNumerico) || precoNumerico < 0) {
      encontrados.preco = 'Informe o valor por passageiro.';
    }
    if (veiculo.dados && vagas > veiculo.dados.capacidadeVagas) {
      encontrados.vagas = `Seu veículo comporta ${veiculo.dados.capacidadeVagas} passageiros.`;
    }

    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const carona = await caronaService.criar({
        origemNome: origem.trim(),
        origemLat,
        origemLng,
        destinoNome: destino.trim(),
        dataHoraPartida: partida!,
        vagas,
        precoPorPassageiro: precoNumerico,
        veiculoId: veiculo.dados?.id,
        observacoes: observacoes.trim() || undefined,
        preferencias,
      });

      navegar('ride-details', { caronaId: carona.id });
    } catch (falha) {
      setErros({ geral: falha instanceof Error ? falha.message : 'Não foi possível publicar.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Oferecer carona" onVoltar={voltar} compacto />

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!veiculo.carregando && !veiculo.dados ? (
          <Card style={estilos.cardVeiculo}>
            <Text style={estilos.cardVeiculoTitulo}>Cadastre seu veículo</Text>
            <Text style={estilos.cardVeiculoTexto}>
              Você precisa de um veículo cadastrado para os passageiros saberem em que carro entram.
            </Text>
            <Button
              label="Cadastrar veículo"
              variante="secundario"
              onPress={() => navegar('car')}
              style={estilos.cardVeiculoBotao}
            />
          </Card>
        ) : null}

        <Text style={estilos.secao}>Trajeto</Text>
        <Field
          marcador
          placeholder="De onde você sai?"
          value={origem}
          onChangeText={(valor) => {
            setOrigem(valor);
            setOrigemLat(undefined);
            setOrigemLng(undefined);
          }}
          ajuda="Use pontos conhecidos: Centro, Campus UCB Taguatinga, Águas Claras..."
          erro={erros.origem}
        />

        <View style={estilos.botaoLocalizacao}>
          <Button
            label={localizando ? 'Obtendo localização...' : 'Usar minha localização atual'}
            variante="contorno"
            onPress={usarMinhaLocalizacao}
            carregando={localizando}
          />
        </View>

        <Field
          icone="map-pin"
          placeholder="Para onde você vai?"
          value={destino}
          onChangeText={setDestino}
          erro={erros.destino}
        />

        <Text style={estilos.secao}>Data e hora</Text>
        <View style={estilos.linhaDupla}>
          <View style={estilos.flex}>
            <Field
              icone="calendar"
              placeholder="dd/mm/aaaa"
              value={data}
              onChangeText={(valor) => setData(mascaras.data(valor))}
              keyboardType="numeric"
            />
          </View>
          <View style={estilos.flex}>
            <Field
              icone="clock"
              placeholder="08:30"
              value={hora}
              onChangeText={(valor) => setHora(mascaras.hora(valor))}
              keyboardType="numeric"
              erro={erros.data}
            />
          </View>
        </View>

        <Text style={estilos.secao}>Vagas disponíveis</Text>
        <OptionRow opcoes={[1, 2, 3, 4]} valor={vagas} onChange={setVagas} />
        {erros.vagas ? <Text style={estilos.erro}>{erros.vagas}</Text> : null}

        <Text style={estilos.secao}>Preço por pessoa</Text>
        <Field
          icone="dollar-sign"
          placeholder="0,00"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          ajuda="Combine um valor que cubra o combustível — não é cobrança de transporte."
          erro={erros.preco}
        />

        <Text style={estilos.secao}>Informações adicionais</Text>
        <TextArea
          placeholder="Ex.: ponto de encontro, horário de saída, bagagem..."
          value={observacoes}
          onChangeText={setObservacoes}
        />

        <Text style={estilos.secao}>Preferências</Text>
        {PREFERENCIAS.map((item) => (
          <Checkbox
            key={item}
            marcado={preferencias.includes(item)}
            onToggle={() => alternarPreferencia(item)}
          >
            <Text style={estilos.preferencia}>{item}</Text>
          </Checkbox>
        ))}

        {veiculo.dados ? (
          <InfoBox icone="car">
            Esta carona sai com {veiculo.dados.modelo} • placa {veiculo.dados.placa}.
          </InfoBox>
        ) : null}

        {erros.geral ? <Text style={estilos.erro}>{erros.geral}</Text> : null}
      </ScrollView>

      <View style={estilos.rodape}>
        <Button
          label="Publicar carona"
          variante="secundario"
          onPress={publicar}
          carregando={enviando}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  botaoLocalizacao: {
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
  },

  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  conteudo: { padding: spacing.xl },

  cardVeiculo: { marginBottom: spacing.xl, gap: spacing.sm },
  cardVeiculoTitulo: { ...typography.title, color: colors.navy },
  cardVeiculoTexto: { ...typography.small, color: colors.mutedForeground, lineHeight: 19 },
  cardVeiculoBotao: { marginTop: spacing.md },

  secao: { ...typography.smallMedium, color: colors.navy, marginBottom: spacing.md, marginTop: spacing.sm },
  linhaDupla: { flexDirection: 'row', gap: spacing.md },
  preferencia: { ...typography.small, color: colors.navy },
  erro: { ...typography.caption, color: colors.destructive, marginBottom: spacing.md },

  rodape: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
