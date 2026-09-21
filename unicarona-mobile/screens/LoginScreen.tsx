import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { Button, Field } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { useNavigation } from '../state/NavigationContext';
import { useAuth } from '../state/AuthContext';

export function LoginScreen() {
  const { navegar, reiniciar } = useNavigation();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const submeter = async () => {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || !senha) {
      setErro('Informe e-mail e senha para continuar.');
      return;
    }

    setErro(null);
    setEnviando(true);

    try {
      const usuario = await entrar(emailLimpo, senha);

      // Conta criada mas ainda não confirmada volta para a verificação.
      if (!usuario.emailValidado) {
        navegar('verify-email', { email: usuario.email });
        return;
      }

      reiniciar('home');
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Verifique o e-mail e a senha.');
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
      <View style={estilos.marcaBloco}>
        <View style={estilos.marca}>
          <Icon name="car" size={32} color={colors.orange} />
        </View>
        <Text style={estilos.marcaNome}>UniCarona</Text>
        <Text style={estilos.marcaTagline}>Caronas universitárias seguras</Text>
      </View>

      <View style={estilos.intro}>
        <Text style={estilos.titulo}>Bem-vindo de volta!</Text>
        <Text style={estilos.subtitulo}>Entre com sua conta universitária</Text>
      </View>

      <Field
        label="E-mail institucional"
        icone="mail"
        placeholder="nome@a.ucb.br"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Field
        label="Senha"
        icone="lock"
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={!mostrarSenha}
        iconeDireita={mostrarSenha ? 'eye-off' : 'eye'}
        onIconeDireita={() => setMostrarSenha((atual) => !atual)}
        erro={erro ?? undefined}
      />

      <Button
        label="Esqueceu a senha?"
        variante="fantasma"
        onPress={() => navegar('forgot-password')}
        style={estilos.esqueci}
      />

      <Button
        label="Entrar"
        iconeDireita="arrow-right"
        onPress={submeter}
        carregando={enviando}
      />

      <View style={estilos.divisor}>
        <View style={estilos.divisorLinha} />
        <Text style={estilos.divisorTexto}>ou</Text>
        <View style={estilos.divisorLinha} />
      </View>

      <Button label="Criar nova conta" variante="contorno" onPress={() => navegar('register')} />

      <Text style={estilos.rodape}>
        Primeira vez? Cadastre-se e comece a compartilhar caronas.
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },

  marcaBloco: { alignItems: 'center', marginBottom: spacing.xxl },
  marca: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  marcaNome: { ...typography.h2, color: colors.navy },
  marcaTagline: { ...typography.small, color: colors.mutedForeground, marginTop: 2 },

  intro: { marginBottom: spacing.xl },
  titulo: { ...typography.h2, color: colors.navy, marginBottom: spacing.xs },
  subtitulo: { ...typography.small, color: colors.mutedForeground },

  esqueci: { alignSelf: 'flex-end', paddingHorizontal: 0, marginTop: -spacing.sm, marginBottom: spacing.md },

  divisor: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  divisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  divisorTexto: { ...typography.caption, color: colors.mutedForeground },

  rodape: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
