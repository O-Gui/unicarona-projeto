import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { apiRequest } from '../services/api';
import { BrandHeader } from '../components/BrandHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { styles } from '../theme/styles';
import {friendlyErrorMessage} from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Field } from '../components/Field';

function VerifyPasswordResetScreen({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

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
        '/auth/verify-password-reset',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            codigo: code,
          }),
        },
      );

      Alert.alert('Código confirmado', response.message, [
        {
          text: 'Continuar',
          onPress: () => onVerified(code),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Código inválido',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'O código é inválido ou expirou.',
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
        <Text style={styles.eyebrow}>QUASE LÁ</Text>

        <Text style={styles.title}>
          Confirme o código
        </Text>

        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para {email}.
        </Text>

        <Field
          label="Código de recuperação"
          value={code}
          onChangeText={(value: string) =>
            setCode(value.replace(/\D/g, '').slice(0, 6))
          }
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          icon="shield-checkmark-outline"
        />

        <PrimaryButton
          label={loading ? 'Validando...' : 'Confirmar código'}
          onPress={verify}
          disabled={loading}
        />

        <Text style={styles.centerHint}>
          O código expira em poucos minutos.
        </Text>
      </View>
    </ScrollView>
  );
}
