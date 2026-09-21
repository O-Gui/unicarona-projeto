import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  BottomBar,
  Button,
  Card,
  Checkbox,
  Header,
  Screen,
  SectionTitle,
  TextArea,
} from '../components/ui';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { denunciaService } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';

/**
 * UC — Reportar problema. Envia POST /denuncias. Recebe por parâmetro quem
 * está sendo denunciado (`alvoId`/`alvoNome`) e a carona, quando vem dos
 * detalhes de uma viagem.
 */

const MOTIVOS = [
  { id: 'seguranca', label: 'Problema de segurança', descricao: 'Direção perigosa ou comportamento suspeito' },
  { id: 'assedio', label: 'Assédio ou abuso', descricao: 'Comentários ou ações inadequadas' },
  { id: 'fraude', label: 'Fraude ou golpe', descricao: 'Tentativa de fraude financeira' },
  { id: 'falta', label: 'Não compareceu', descricao: 'Motorista ou passageiro faltou sem avisar' },
  { id: 'veiculo', label: 'Problema com o veículo', descricao: 'Veículo diferente ou em más condições' },
  { id: 'rota', label: 'Desvio de rota', descricao: 'Trajeto diferente do combinado' },
  { id: 'pagamento', label: 'Problema de pagamento', descricao: 'Cobrança indevida ou valor errado' },
  { id: 'outro', label: 'Outro motivo', descricao: 'Descreva o que aconteceu' },
];

export function ReportScreen() {
  const { atual, voltar } = useNavigation();
  const alvoId: string | undefined = atual.params?.alvoId;
  const alvoNome: string | undefined = atual.params?.alvoNome;
  const caronaId: string | undefined = atual.params?.caronaId;
  const trajeto: string | undefined = atual.params?.trajeto;

  const [motivo, setMotivo] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [anonima, setAnonima] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const enviar = async () => {
    if (!motivo) {
      setErro('Escolha o motivo da denúncia.');
      return;
    }
    if (descricao.trim().length < 10) {
      setErro('Descreva o problema com pelo menos 10 caracteres.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await denunciaService.criar({
        motivo,
        descricao: descricao.trim(),
        alvoId,
        caronaId,
        anonima,
      });

      setSucesso(resposta.message);
      setDescricao('');
      setMotivo(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível enviar a denúncia.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <Header titulo="Reportar problema" onVoltar={voltar}>
        <View style={estilos.avisoHeader}>
          <Icon name="shield" size={20} color={colors.white} />
          <View style={estilos.flex}>
            <Text style={estilos.avisoTitulo}>Sua segurança é prioridade</Text>
            <Text style={estilos.avisoTexto}>
              Toda denúncia é analisada em até 24 horas. Em caso de emergência, use o botão de SOS.
            </Text>
          </View>
        </View>
      </Header>

      <Screen contentStyle={estilos.conteudo}>
        {alvoNome ? (
          <Card style={estilos.cartaoAlvo}>
            <Text style={estilos.rotulo}>Denunciando</Text>
            <View style={estilos.linhaAlvo}>
              <Avatar nome={alvoNome} tamanho={48} />
              <View style={estilos.flex}>
                <Text style={estilos.alvoNome}>{alvoNome}</Text>
                {trajeto ? <Text style={estilos.alvoTrajeto}>{trajeto}</Text> : null}
              </View>
            </View>
          </Card>
        ) : null}

        <View style={estilos.bloco}>
          <SectionTitle>Motivo</SectionTitle>
          {MOTIVOS.map((item) => {
            const ativo = motivo === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setMotivo(item.id)}
                style={[estilos.opcao, ativo && estilos.opcaoAtiva]}
              >
                <View style={[estilos.radio, ativo && estilos.radioAtivo]}>
                  {ativo ? <View style={estilos.radioInterno} /> : null}
                </View>
                <View style={estilos.flex}>
                  <Text style={estilos.opcaoTitulo}>{item.label}</Text>
                  <Text style={estilos.opcaoDescricao}>{item.descricao}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <TextArea
          label="Descreva o problema"
          placeholder="Forneça o máximo de detalhes possível sobre o que aconteceu..."
          value={descricao}
          onChangeText={setDescricao}
        />

        <Card>
          <Checkbox marcado={anonima} onToggle={() => setAnonima(!anonima)}>
            <Text style={estilos.opcaoTitulo}>Enviar de forma anônima</Text>
            <Text style={estilos.opcaoDescricao}>
              Sua identidade não é revelada à pessoa denunciada.
            </Text>
          </Checkbox>
        </Card>

        <View style={estilos.alerta}>
          <Icon name="alert-circle" size={18} color={colors.warning} />
          <Text style={estilos.alertaTexto}>
            Denúncias falsas podem levar à suspensão da conta. Use este recurso com responsabilidade.
          </Text>
        </View>

        {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
        {sucesso ? <Text style={estilos.sucesso}>{sucesso}</Text> : null}
      </Screen>

      <BottomBar>
        <Button label="Enviar denúncia" icone="send" carregando={enviando} onPress={enviar} />
      </BottomBar>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  avisoHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: tints.onNavy,
  },
  avisoTitulo: { ...typography.smallMedium, color: colors.white },
  avisoTexto: { ...typography.caption, color: tints.onNavyText, marginTop: 2 },

  conteudo: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },

  cartaoAlvo: { gap: spacing.md },
  rotulo: { ...typography.caption, color: colors.mutedForeground },
  linhaAlvo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  alvoNome: { ...typography.bodyMedium, color: colors.navy },
  alvoTrajeto: { ...typography.small, color: colors.mutedForeground },

  bloco: { gap: spacing.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  opcaoAtiva: { borderColor: colors.orange, backgroundColor: tints.orange },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioAtivo: { borderColor: colors.orange },
  radioInterno: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.orange },
  opcaoTitulo: { ...typography.smallMedium, color: colors.navy },
  opcaoDescricao: { ...typography.caption, color: colors.mutedForeground, marginTop: 2 },

  alerta: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
  },
  alertaTexto: { ...typography.caption, color: colors.navy, flex: 1 },

  erro: { ...typography.small, color: colors.destructive },
  sucesso: { ...typography.small, color: colors.success },
});
