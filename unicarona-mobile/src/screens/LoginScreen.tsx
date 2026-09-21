import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { apiRequest } from '../services/api';
import type { AuthResponse, Screen } from '../types';
import { BrandHeader } from '../components/BrandHeader';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { styles } from '../theme/styles';
import {friendlyErrorMessage} from '../services/api';

function LoginScreen({
  onNavigate,
  onLogin,
}: {
  onNavigate: (screen: Screen) => void;
  onLogin: (response: AuthResponse) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert('Preencha seus dados', 'Informe e-mail e senha para continuar.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, senha: password }),
      });
      await onLogin(response);
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        friendlyErrorMessage(error instanceof Error ? error.message : '', 'Verifique o e-mail e a senha e tente novamente.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <ScrollView
    contentContainerStyle={styles.loginContent}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.loginHeader}>
      <BrandHeader compact />
    </View>

    <View style={styles.loginCard}>
      <View style={styles.loginIntro}>
        <Text style={styles.loginTitle}>
          Bem-vindo de volta!
        </Text>

        <Text style={styles.loginSubtitle}>
          Entre para encontrar sua carona
        </Text>
      </View>

      <Field
        label="E-mail institucional"
        value={email}
        onChangeText={setEmail}
        placeholder="nome@a.ucb.br"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        icon="mail-outline"
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        secureTextEntry={!showPassword}
        icon="lock-closed-outline"
        rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      <Pressable
        style={styles.loginForgot}
        onPress={() => onNavigate('forgotPassword')}
      >
        <Text style={styles.link}>
          Esqueci minha senha
        </Text>
      </Pressable>

      <PrimaryButton
        label={loading ? 'Entrando...' : 'Entrar'}
        onPress={submit}
        disabled={loading}
      />

      <View style={styles.loginBottom}>
        <Text style={styles.bodyText}>
          Ainda não tem uma conta?{' '}
        </Text>

        <Pressable onPress={() => onNavigate('register')}>
          <Text style={styles.link}>
            Criar conta
          </Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);
}

