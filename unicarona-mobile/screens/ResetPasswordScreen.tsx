import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BackButton, Button, Field, InfoBox } from '../components/ui';
import { colors, spacing, typography } from '../theme';
import { authService } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';

export function ResetPasswordScreen() {
  const { atual, voltar, reiniciar } = useNavigation();
  const email: string = atual.params?.email ?? '';
  const codigo: string = atual.params?.codigo ?? '';

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const submeter = async () => {
    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      setErro('A senha precisa ter pelo menos uma letra e um número.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('As senhas não são iguais.');
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      await authService.redefinirSenha(email, codigo, senha);
      reiniciar('login');
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível redefinir sua senha.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={voltar} />

      <Text style={estilos.titulo}>Crie uma nova senha</Text>
      <Text style={estilos.subtitulo}>Escolha uma senha segura para voltar a acessar sua conta.</Text>

      <Field
        label="Nova senha"
        icone="lock"
        placeholder="Mínimo de 8 caracteres"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={!mostrar}
        iconeDireita={mostrar ? 'eye-off' : 'eye'}
        onIconeDireita={() => setMostrar((atual) => !atual)}
      />

      <Field
        label="Confirme a nova senha"
        icone="lock"
        placeholder="Digite a senha novamente"
        value={confirmacao}
        onChangeText={setConfirmacao}
        secureTextEntry={!mostrar}
        erro={erro ?? undefined}
      />

      <InfoBox icone="shield">Use pelo menos 8 caracteres, com uma letra e um número.</InfoBox>

      <Button label="Redefinir senha" onPress={submeter} carregando={enviando} style={estilos.botao} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, paddingTop: spacing.xxl },
  titulo: { ...typography.h2, color: colors.navy, marginTop: spacing.xxl },
  subtitulo: {
    ...typography.small,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  botao: { marginTop: spacing.xl },
});
