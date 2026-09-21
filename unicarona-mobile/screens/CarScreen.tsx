import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Header,
  InfoBox,
  Loading,
  OptionRow,
  Screen,
  SectionTitle,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { mascaras } from '../lib/format';
import { veiculoService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useAuth } from '../state/AuthContext';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Meu veículo. Fala com /veiculos, que identifica o dono pelo JWT: o app
 * não envia mais `usuarioId` no corpo. Cadastrar um veículo promove o perfil
 * de PASSAGEIRO para AMBOS no backend.
 */
export function CarScreen() {
  const { voltar, navegar } = useNavigation();
  const { usuario, atualizarUsuario } = useAuth();

  const veiculos = useCarregar(() => veiculoService.listar(), []);

  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [ano, setAno] = useState('');
  const [capacidade, setCapacidade] = useState(4);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [formularioAberto, setFormularioAberto] = useState(false);

  // Sem nenhum veículo, o formulário já abre — é o caminho mais comum aqui.
  useEffect(() => {
    if (!veiculos.carregando && (veiculos.dados?.length ?? 0) === 0) {
      setFormularioAberto(true);
    }
  }, [veiculos.carregando, veiculos.dados]);

  const salvar = async () => {
    if (modelo.trim().length < 2) {
      setErro('Informe o modelo do veículo.');
      return;
    }
    if (placa.trim().length < 7) {
      setErro('A placa precisa ter 7 caracteres (ABC1234 ou ABC1D23).');
      return;
    }

    const anoNumero = ano.trim() ? Number(ano.trim()) : undefined;
    if (anoNumero !== undefined && (Number.isNaN(anoNumero) || anoNumero < 1950)) {
      setErro('Ano inválido.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      await veiculoService.salvar({
        modelo: modelo.trim(),
        placa: placa.trim(),
        capacidade,
        cor: cor.trim() || undefined,
        ano: anoNumero,
      });

      // Quem cadastra veículo passa a poder oferecer carona.
      if (usuario?.perfil === 'PASSAGEIRO') atualizarUsuario({ perfil: 'AMBOS' });

      setModelo('');
      setPlaca('');
      setCor('');
      setAno('');
      setFormularioAberto(false);
      await veiculos.recarregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível salvar o veículo.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = (id: string, nome: string) => {
    Alert.alert('Remover veículo', `Remover ${nome} da sua conta?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await veiculoService.remover(id);
            await veiculos.recarregar();
          } catch (falha) {
            Alert.alert(
              'Não foi possível remover',
              falha instanceof Error ? falha.message : 'Tente novamente.',
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Meu veículo" onVoltar={voltar} />

      <Screen contentStyle={estilos.conteudo}>
        {veiculos.carregando ? (
          <Loading />
        ) : veiculos.erro ? (
          <ErrorState mensagem={veiculos.erro} onTentarNovamente={veiculos.recarregar} />
        ) : (
          <>
            {(veiculos.dados?.length ?? 0) > 0 ? (
              <View style={estilos.bloco}>
                <SectionTitle
                  acao={formularioAberto ? 'Fechar' : 'Adicionar'}
                  onAcao={() => {
                    setFormularioAberto(!formularioAberto);
                    setErro(null);
                  }}
                >
                  Veículos cadastrados
                </SectionTitle>

                {veiculos.dados!.map((veiculo, indice) => (
                  <Card key={veiculo.id} style={estilos.cartao}>
                    <View style={estilos.linhaVeiculo}>
                      <View style={estilos.bolha}>
                        <Icon name="car" size={22} color={colors.orange} />
                      </View>

                      <View style={estilos.flex}>
                        <Text style={estilos.modelo}>{veiculo.modelo}</Text>
                        <Text style={estilos.detalhe}>
                          {[veiculo.cor, veiculo.ano].filter(Boolean).join(' • ') || 'Sem detalhes'}
                        </Text>
                      </View>

                      {indice === 0 ? <Badge cor={colors.orange}>Principal</Badge> : null}
                    </View>

                    <View style={estilos.dados}>
                      <View style={estilos.dado}>
                        <Text style={estilos.dadoRotulo}>Placa</Text>
                        <Text style={estilos.dadoValor}>{veiculo.placa}</Text>
                      </View>
                      <View style={estilos.dado}>
                        <Text style={estilos.dadoRotulo}>Vagas</Text>
                        <Text style={estilos.dadoValor}>{veiculo.capacidadeVagas}</Text>
                      </View>
                    </View>

                    <View style={estilos.acoes}>
                      <Button
                        label="Oferecer carona"
                        variante="secundario"
                        icone="car"
                        onPress={() => navegar('offer-ride')}
                        style={estilos.flex}
                      />
                      <Button
                        label="Remover"
                        variante="perigo"
                        onPress={() => remover(veiculo.id, veiculo.modelo)}
                        style={estilos.flex}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            ) : formularioAberto ? null : (
              <EmptyState
                icone="car"
                titulo="Nenhum veículo cadastrado"
                descricao="Cadastre seu carro para poder oferecer caronas."
                acao="Cadastrar veículo"
                onAcao={() => setFormularioAberto(true)}
              />
            )}

            {formularioAberto ? (
              <Card style={estilos.formulario}>
                <SectionTitle>Dados do veículo</SectionTitle>

                <Field
                  label="Modelo"
                  placeholder="Honda Civic"
                  icone="car"
                  value={modelo}
                  onChangeText={setModelo}
                  autoCapitalize="words"
                />

                <Field
                  label="Placa"
                  placeholder="ABC1D23"
                  icone="edit"
                  value={placa}
                  onChangeText={(valor) => setPlaca(mascaras.placa(valor))}
                  autoCapitalize="characters"
                  ajuda="Aceita o formato antigo (ABC1234) e o Mercosul (ABC1D23)."
                />

                <View style={estilos.linhaDupla}>
                  <View style={estilos.flex}>
                    <Field label="Cor" placeholder="Prata" value={cor} onChangeText={setCor} />
                  </View>
                  <View style={estilos.flex}>
                    <Field
                      label="Ano"
                      placeholder="2020"
                      keyboardType="numeric"
                      value={ano}
                      onChangeText={(valor) => setAno(valor.replace(/\D/g, '').slice(0, 4))}
                    />
                  </View>
                </View>

                <View style={estilos.bloco}>
                  <Text style={estilos.rotulo}>Vagas para passageiros</Text>
                  <OptionRow
                    opcoes={[1, 2, 3, 4, 5, 6]}
                    valor={capacidade}
                    onChange={setCapacidade}
                  />
                </View>

                {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

                <Button label="Salvar veículo" carregando={salvando} onPress={salvar} />
              </Card>
            ) : null}

            <InfoBox icone="shield">
              A placa é única no sistema: se ela já estiver cadastrada em outra conta, o servidor
              recusa o cadastro. Cadastrar um veículo libera a opção de oferecer caronas.
            </InfoBox>
          </>
        )}
      </Screen>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  bloco: { gap: spacing.md },

  cartao: { gap: spacing.md },
  linhaVeiculo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bolha: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(242, 140, 24, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelo: { ...typography.bodyMedium, color: colors.navy },
  detalhe: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  dados: { flexDirection: 'row', gap: spacing.md },
  dado: { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.muted },
  dadoRotulo: { ...typography.caption, color: colors.mutedForeground },
  dadoValor: { ...typography.smallMedium, color: colors.navy },

  acoes: { flexDirection: 'row', gap: spacing.sm },

  formulario: { gap: spacing.md },
  linhaDupla: { flexDirection: 'row', gap: spacing.md },
  rotulo: { ...typography.smallMedium, color: colors.navy },
  erro: { ...typography.small, color: colors.destructive },
});
