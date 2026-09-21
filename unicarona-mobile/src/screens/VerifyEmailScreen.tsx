import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { apiRequest } from '../services/api';
import { BrandHeader } from '../components/BrandHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { styles } from '../theme/styles';
import {friendlyErrorMessage} from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';

function VerifyEmailScreen({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      Alert.alert(
        'Código inválido',
        'Digite o código de 6 dígitos enviado para seu e-mail.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/verify-email',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            codigo: code,
          }),
        },
      );

      Alert.alert('E-mail validado', response.message, [
        {
          text: 'Entrar',
          onPress: onVerified,
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível validar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Código inválido ou expirado.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/resend-verification',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
      );

      Alert.alert('Código reenviado', response.message);
    } catch (error) {
      Alert.alert(
        'Não foi possível reenviar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Tente novamente em alguns instantes.',
        ),
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.verifyScreen}>
      <View style={styles.verifyTop}>
        <Pressable onPress={onVerified} style={styles.verifyBackButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.navy}
          />
        </Pressable>
      </View>

      <View style={styles.verifyContent}>
        <View style={styles.verifyIcon}>
          <Ionicons
            name="mail-outline"
            size={40}
            color={COLORS.orange}
          />
        </View>

        <Text style={styles.verifyTitle}>
          Verifique seu e-mail
        </Text>

        <Text style={styles.verifySubtitle}>
          Enviamos um código de 6 dígitos para{' '}
          <Text style={styles.verifyEmail}>
            {email}
          </Text>
        </Text>

        <View style={styles.otpContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                code.length === index && styles.otpBoxActive,
              ]}
            >
              <Text style={styles.otpText}>
                {code[index] ?? ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Campo invisível usado para receber o código */}
        <TextInput
          value={code}
          onChangeText={(value: string) =>
            setCode(value.replace(/\D/g, '').slice(0, 6))
          }
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          style={styles.otpInput}
        />

        <View style={styles.verifyActions}>
          <PrimaryButton
            label={loading ? 'Verificando...' : 'Verificar'}
            onPress={verify}
            disabled={loading}
          />

          <Pressable
            onPress={resend}
            disabled={resending}
            style={styles.resendButtonNew}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={COLORS.orange}
            />

            <Text style={styles.resendText}>
              {resending ? 'Enviando...' : 'Reenviar código'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.verifyHint}>
          Não recebeu o e-mail? Verifique sua caixa de spam.
        </Text>
      </View>
    </View>
  );
}



