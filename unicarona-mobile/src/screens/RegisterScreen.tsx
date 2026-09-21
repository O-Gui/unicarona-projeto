import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { apiRequest } from '../services/api';
import type { RegisterResponse, Screen } from '../types';
import { BrandHeader } from '../components/BrandHeader';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { styles } from '../theme/styles';
import {friendlyErrorMessage} from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

function RegisterScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: (email: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [course, setCourse] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCpf = cpf.replace(/\D/g, '');

    if (
      !name.trim() ||
      !cleanEmail ||
      cleanCpf.length !== 11 ||
      !course.trim() ||
      password.length < 8
    ) {
      Alert.alert(
        'Confira seus dados',
        'Preencha nome, e-mail institucional, CPF, curso e uma senha com pelo menos 8 caracteres.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Senhas diferentes',
        'A senha e a confirmação de senha precisam ser iguais.',
      );
      return;
    }

    if (!accepted) {
      Alert.alert('Termos de uso', 'Aceite os termos para criar sua conta.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nome: name.trim(),
          email: cleanEmail,
          cpf: cleanCpf,
          senha: password,
          perfil: 'PASSAGEIRO',
        }),
      });

      Alert.alert('Cadastro realizado', response.message, [
        {
          text: 'Continuar',
          onPress: () => onRegistered(response.usuario.email),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível cadastrar',
        friendlyErrorMessage(
          error instanceof Error ? error.message : '',
          'Verifique os dados informados e tente novamente.',
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
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </Pressable>

        <BrandHeader compact />
      </View>

      <View style={styles.authCard}>
        <Text style={styles.eyebrow}>FAÇA PARTE</Text>

        <Text style={styles.title}>Crie sua conta</Text>

        <Text style={styles.subtitle}>
          Junte-se à comunidade universitária de caronas.
        </Text>

        {/* PROGRESSO */}
        <View style={styles.progressContainer}>
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
          <View style={styles.progressInactive} />
        </View>

        <Text style={styles.progressText}>Passo 1 de 3</Text>

        <Field
          label="Nome completo"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome completo"
          icon="person-outline"
          autoCapitalize="words"
        />

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

        <Text style={styles.helperText}>
          Use seu e-mail institucional da Universidade Católica de Brasília.
        </Text>

        <Field
          label="CPF"
          value={cpf}
          onChangeText={(value: string) =>
            setCpf(value.replace(/\D/g, '').slice(0, 11))
          }
          placeholder="00000000000"
          keyboardType="numeric"
          icon="card-outline"
        />

        <Field
          label="Curso"
          value={course}
          onChangeText={setCourse}
          placeholder="Ex.: Engenharia de Software"
          icon="school-outline"
          autoCapitalize="words"
        />

        <Field
          label="Crie uma senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo de 8 caracteres"
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Field
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirme sua senha"
          secureTextEntry
          icon="lock-closed-outline"
        />

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.navyLight}
          />

          <Text style={styles.infoText}>
            Seu cadastro começa como{' '}
            <Text style={styles.infoStrong}>passageiro</Text>. Depois você
            poderá oferecer caronas e cadastrar seu veículo.
          </Text>
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAccepted(!accepted)}
        >
          <Ionicons
            name={accepted ? 'checkbox' : 'square-outline'}
            size={22}
            color={accepted ? COLORS.orange : COLORS.muted}
          />

          <Text style={styles.termsText}>
            Li e aceito os{' '}
            <Text style={styles.link}>termos de uso</Text> e a{' '}
            <Text style={styles.link}>política de privacidade</Text>.
          </Text>
        </Pressable>

        <PrimaryButton
          label={loading ? 'Criando conta...' : 'Continuar'}
          onPress={submit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}
