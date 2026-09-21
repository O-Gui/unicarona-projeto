import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { apiRequest } from '../services/api';
import { BrandHeader } from '../components/BrandHeader';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { OutlineButton } from '../components/OutlineButton';
import { styles } from '../theme/styles';
import {friendlyErrorMessage} from '../services/api';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

function ForgotPasswordScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert(
        'Informe seu e-mail',
        'Digite seu e-mail institucional para continuar.',
      );
      return;
    }

    if (!/^[^\s@]+@a\.ucb\.br$/i.test(cleanEmail)) {
      Alert.alert(
        'E-mail inválido',
        'Use seu e-mail institucional @a.ucb.br.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ message: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({
            email: cleanEmail,
          }),
        },
      );

      Alert.alert('Código enviado', response.message, [
        {
          text: 'Continuar',
          onPress: () => onContinue(cleanEmail),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível continuar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Verifique o e-mail informado e tente novamente.',
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
        <Text style={styles.eyebrow}>RECUPERAÇÃO DE ACESSO</Text>

        <Text style={styles.title}>
          Esqueceu sua senha?
        </Text>

        <Text style={styles.subtitle}>
          Informe seu e-mail institucional e enviaremos um
          código para redefinir sua senha.
        </Text>

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

        <PrimaryButton
          label={loading ? 'Enviando...' : 'Enviar código'}
          onPress={submit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

