import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Loading, SectionTitle } from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, typography } from '../theme';
import { formatarHora } from '../lib/format';
import { caronaService } from '../lib/servicos';
import { useCarregar } from '../lib/useCarregar';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC08 — Central de segurança. Busca a próxima carona confirmada em
 * GET /caronas/minhas para mostrar motorista, veículo e trajeto, que é a
 * informação que alguém precisa compartilhar numa emergência.
 */

const TELEFONES = [
  { nome: 'Polícia Militar', numero: '190', descricao: 'Emergências policiais' },
  { nome: 'SAMU', numero: '192', descricao: 'Emergências médicas' },
  { nome: 'Bombeiros', numero: '193', descricao: 'Incêndios e resgates' },
];

export function EmergencyScreen() {
  const { voltar, navegar } = useNavigation();
  const [alertaAtivo, setAlertaAtivo] = useState(false);

  const minhas = useCarregar(() => caronaService.minhas(), []);

  const proxima = [...(minhas.dados?.reservadas ?? []), ...(minhas.dados?.oferecidas ?? [])]
    .filter((carona) => carona.status === 'ABERTA' || carona.status === 'LOTADA')
    .sort(
      (a, b) => new Date(a.dataHoraPartida).getTime() - new Date(b.dataHoraPartida).getTime(),
    )[0];

  const ligar = (numero: string) => {
    Linking.openURL(`tel:${numero}`).catch(() =>
      Alert.alert('Não foi possível ligar', `Disque ${numero} manualmente.`),
    );
  };

  const ativarAlerta = () => {
    Alert.alert(
      'Ativar alerta de emergência',
      'Isso marca que você precisa de ajuda e abre a ligação para o 190. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ativar',
          style: 'destructive',
          onPress: () => {
            setAlertaAtivo(true);
            ligar('190');
          },
        },
      ],
    );
  };

  return (
    <View style={estilos.tela}>
      <View style={estilos.header}>
        <View style={estilos.headerLinha}>
          <Pressable onPress={voltar} hitSlop={12}>
            <Icon name="arrow-left" size={24} color={colors.white} />
          </Pressable>
          <Text style={estilos.headerTitulo}>Central de segurança</Text>
        </View>

        <View style={estilos.avisoHeader}>
          <Icon name="alert-circle" size={20} color={colors.white} />
          <Text style={estilos.avisoTexto}>
            Use em situações de risco. Em emergência real, ligue sempre para os serviços públicos.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Card style={[estilos.cartaoPanico, alertaAtivo && estilos.cartaoPanicoAtivo]}>
          <View style={estilos.linhaPanico}>
            <View style={estilos.bolhaPanico}>
              <Icon name="alert-circle" size={24} color={colors.white} />
            </View>
            <View style={estilos.flex}>
              <Text style={estilos.tituloPanico}>Botão do pânico</Text>
              <Text style={estilos.descricaoPanico}>
                {alertaAtivo ? 'Alerta ativado neste aparelho.' : 'Ativar em emergências'}
              </Text>
            </View>
          </View>

          <Button
            label={alertaAtivo ? 'Ligar novamente para o 190' : 'Ativar alerta de emergência'}
            variante="perigo"
            icone="phone"
            onPress={alertaAtivo ? () => ligar('190') : ativarAlerta}
          />

          <Text style={estilos.notaPanico}>
            O app ainda não envia alertas automáticos. Compartilhe os dados da carona abaixo com
            alguém de confiança antes de sair.
          </Text>
        </Card>

        <View style={estilos.bloco}>
          <SectionTitle>Sua próxima carona</SectionTitle>

          {minhas.carregando ? (
            <Loading />
          ) : !proxima ? (
            <Card>
              <Text style={estilos.vazio}>
                Nenhuma carona confirmada no momento. Quando você reservar uma, os dados do
                motorista e do veículo aparecem aqui.
              </Text>
            </Card>
          ) : (
            <Card style={estilos.bloco}>
              <View style={estilos.linhaMotorista}>
                <Avatar nome={proxima.motorista.nome} />
                <View style={estilos.flex}>
                  <Text style={estilos.motoristaNome}>{proxima.motorista.nome}</Text>
                  <Text style={estilos.motoristaDetalhe}>
                    {proxima.veiculo?.modelo ?? 'Veículo não informado'}
                  </Text>
                </View>
              </View>

              <View style={estilos.dados}>
                <Dado rotulo="Placa" valor={proxima.veiculo?.placa ?? '—'} />
                <Dado rotulo="Saída" valor={formatarHora(proxima.dataHoraPartida)} />
                <Dado rotulo="Origem" valor={proxima.origem.nome} />
                <Dado rotulo="Destino" valor={proxima.destino.nome} />
              </View>

              <Button
                label="Abrir detalhes da carona"
                variante="contorno"
                onPress={() => navegar('ride-details', { caronaId: proxima.id })}
              />
            </Card>
          )}
        </View>

        <View style={estilos.bloco}>
          <SectionTitle>Telefones de emergência</SectionTitle>

          {TELEFONES.map((contato) => (
            <Pressable
              key={contato.nome}
              onPress={() => ligar(contato.numero)}
              style={({ pressed }) => [estilos.contato, pressed && estilos.pressionado]}
            >
              <View style={estilos.bolhaContato}>
                <Icon name="phone" size={18} color={colors.destructive} />
              </View>
              <View style={estilos.flex}>
                <Text style={estilos.contatoNome}>{contato.nome}</Text>
                <Text style={estilos.contatoDescricao}>{contato.descricao}</Text>
              </View>
              <Text style={estilos.contatoNumero}>{contato.numero}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          label="Reportar um problema"
          variante="contorno"
          icone="alert-circle"
          onPress={() =>
            navegar('report', {
              alvoId: proxima?.motorista.id,
              alvoNome: proxima?.motorista.nome,
              caronaId: proxima?.id,
              trajeto: proxima ? `${proxima.origem.nome} → ${proxima.destino.nome}` : undefined,
            })
          }
        />
      </ScrollView>
    </View>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.dado}>
      <Text style={estilos.dadoRotulo}>{rotulo}</Text>
      <Text style={estilos.dadoValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pressionado: { opacity: 0.85 },

  header: {
    backgroundColor: colors.destructive,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  headerLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  headerTitulo: { ...typography.h3, color: colors.white },
  avisoHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  avisoTexto: { ...typography.caption, color: colors.white, flex: 1 },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },

  cartaoPanico: { gap: spacing.lg, borderColor: colors.destructive },
  cartaoPanicoAtivo: { backgroundColor: 'rgba(220, 38, 38, 0.06)' },
  linhaPanico: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bolhaPanico: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloPanico: { ...typography.title, color: colors.navy },
  descricaoPanico: { ...typography.small, color: colors.mutedForeground },
  notaPanico: { ...typography.caption, color: colors.mutedForeground, textAlign: 'center' },

  bloco: { gap: spacing.md },
  vazio: { ...typography.small, color: colors.mutedForeground },

  linhaMotorista: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  motoristaNome: { ...typography.bodyMedium, color: colors.navy },
  motoristaDetalhe: { ...typography.small, color: colors.mutedForeground },

  dados: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  dado: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  dadoRotulo: { ...typography.caption, color: colors.mutedForeground },
  dadoValor: { ...typography.smallMedium, color: colors.navy },

  contato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  bolhaContato: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contatoNome: { ...typography.smallMedium, color: colors.navy },
  contatoDescricao: { ...typography.caption, color: colors.mutedForeground },
  contatoNumero: { ...typography.title, color: colors.destructive },
});
