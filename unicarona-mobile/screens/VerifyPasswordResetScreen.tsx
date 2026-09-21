import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BackButton, Button, Field } from '../components/ui';
import { colors, spacing, typography } from '../theme';
import { authService } from '../lib/servicos';
import { useNavigation } from '../state/NavigationContext';

export function VerifyPasswordResetScreen() {
  const { atual, voltar, navegar } = useNavigation();
  const email: string = atual.params?.email ?? '';

  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const verificar = async () => {
    if (!/^\d{6}$/.test(codigo)) {
      setErro('Digite os 6 dígitos enviados por e-mail.');
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      await authService.verificarCodigoSenha(email, codigo);
      navegar('reset-password', { email, codigo });
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'O código é inválido ou expirou.');
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

      <Text style={estilos.titulo}>Confirme o código</Text>
      <Text style={estilos.subtitulo}>Enviamos um código de 6 dígitos para {email}.</Text>

      <Field
        label="Código de recuperação"
        icone="shield"
        placeholder="000000"
        value={codigo}
        onChangeText={(valor) => setCodigo(valor.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        erro={erro ?? undefined}
      />

      <Button label="Confirmar código" onPress={verificar} carregando={enviando} />

      <Text style={estilos.dica}>O código expira em poucos minutos.</Text>
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
  dica: { ...typography.small, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.lg },
});
