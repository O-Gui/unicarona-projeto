import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { apiRequest } from '../services/api';
import { BrandHeader } from '../components/BrandHeader';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { styles } from '../theme/styles';
import {friendlyErrorMessage} from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

function ResetPasswordScreen({
  email,
  code,
  onBack,
  onReset,
}: {
  email: string;
  code: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password.length < 8) {
      Alert.alert(
        'Senha inválida',
        'A senha deve ter pelo menos 8 caracteres.',
      );
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      Alert.alert(
        'Senha inválida',
        'A senha deve conter pelo menos uma letra e um número.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'As senhas informadas precisam ser iguais.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/reset-password',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            codigo: code,
            novaSenha: password,
          }),
        },
      );

      Alert.alert(
        'Senha redefinida',
        response.message,
        [
          {
            text: 'Voltar para o login',
            onPress: onReset,
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível redefinir',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Não foi possível redefinir sua senha. Tente novamente.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.authContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authTop}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.white}
          />
        </Pressable>

        <BrandHeader compact />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>NOVA SENHA</Text>

        <Text style={styles.title}>
          Crie uma nova senha
        </Text>

        <Text style={styles.subtitle}>
          Escolha uma senha segura para voltar a acessar sua conta.
        </Text>

        <Field
          label="Nova senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo de 8 caracteres"
          secureTextEntry={!showPassword}
          icon="lock-closed-outline"
          rightIcon={
            showPassword
              ? 'eye-off-outline'
              : 'eye-outline'
          }
          onRightIconPress={() =>
            setShowPassword(!showPassword)
          }
        />

        <Field
          label="Confirme sua nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Digite a senha novamente"
          secureTextEntry={!showConfirmPassword}
          icon="lock-closed-outline"
          rightIcon={
            showConfirmPassword
              ? 'eye-off-outline'
              : 'eye-outline'
          }
          onRightIconPress={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
        />

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.navyLight}
          />

          <Text style={styles.infoText}>
            Use pelo menos 8 caracteres, contendo uma letra e
            um número.
          </Text>
        </View>

        <PrimaryButton
          label={loading ? 'Salvando...' : 'Redefinir senha'}
          onPress={submit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

