import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton, Button, Field, IconBubble } from '../components/ui';
import { colors, spacing, typography } from '../theme';
import { authService } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';

export function ForgotPasswordScreen() {
  const { voltar, navegar } = useNavigation();

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const submeter = async () => {
    const emailLimpo = email.trim().toLowerCase();

    if (!/^[^\s@]+@a\.ucb\.br$/i.test(emailLimpo)) {
      setErro('Use seu e-mail institucional @a.ucb.br.');
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      await authService.esqueciSenha(emailLimpo);
      navegar('verify-password-reset', { email: emailLimpo });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível enviar o código.');
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

      <View style={estilos.icone}>
        <IconBubble nome="lock" cor={colors.orange} tamanho={72} />
      </View>

      <Text style={estilos.titulo}>Esqueceu sua senha?</Text>
      <Text style={estilos.subtitulo}>
        Informe seu e-mail institucional e enviaremos um código para você criar uma nova senha.
      </Text>

      <Field
        label="E-mail institucional"
        icone="mail"
        placeholder="nome@a.ucb.br"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        erro={erro ?? undefined}
      />

      <Button label="Enviar código" onPress={submeter} carregando={enviando} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, paddingTop: spacing.xxl },
  icone: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xl },
  titulo: { ...typography.h2, color: colors.navy, textAlign: 'center' },
  subtitulo: {
    ...typography.small,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
});
