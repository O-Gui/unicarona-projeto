import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  navy: '#1e2a4a',
  navyLight: '#2c3e6b',
  orange: '#ff7a1a',
  background: '#f8f9fb',
  card: '#ffffff',
  border: '#e5e7eb',
  mutedForeground: '#6b7280',
  white: '#ffffff',
  success: '#10b981',
};

export type Car = {
  model: string;
  plate: string;
  capacity: number;
};

// Componente auxiliar de input com ícone
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  icon,
}: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={COLORS.mutedForeground}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.mutedForeground}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

// Botão principal customizado
function PrimaryButton({ label, onPress, disabled }: any) {
  return (
    <Pressable
      style={[styles.saveButton, disabled && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.saveButtonText}>{label}</Text>
    </Pressable>
  );
}

export function CarScreen({
  existingCar,
  onBack,
  onSaved,
}: {
  existingCar: Car | null;
  onBack: () => void;
  onSaved: (car: Car) => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [plate, setPlate] = useState(existingCar?.plate ?? '');
  const [capacity, setCapacity] = useState(
    existingCar ? String(existingCar.capacity) : ''
  );
  const [model, setModel] = useState(existingCar?.model ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const cleanPlate = plate.trim().toUpperCase();
    const seats = Number(capacity);

    if (!cleanPlate || !capacity.trim() || !model.trim()) {
      Alert.alert(
        'Complete o cadastro',
        'Informe modelo, placa e quantidade de vagas.'
      );
      return;
    }

    if (!Number.isInteger(seats) || seats < 1 || seats > 4) {
      Alert.alert('Vagas inválidas', 'Informe uma quantidade entre 1 e 4 vagas.');
      return;
    }

    setSaving(true);
    try {
      await onSaved({
        model: model.trim(),
        plate: cleanPlate,
        capacity: seats,
      });
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.page, { paddingTop: insets.top }]}
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <View style={styles.pageHeader}>
        <Pressable onPress={onBack} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={23} color={COLORS.white} />
        </Pressable>
        <Text style={styles.headerTitleText}>Meu Veículo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.formIntro}>
        <View style={styles.orangeIcon}>
          <Ionicons name="car-sport" size={30} color={COLORS.orange} />
        </View>
        <Text style={styles.title}>
          {existingCar ? 'Meu carro' : 'Cadastre seu carro'}
        </Text>
        <Text style={styles.subtitle}>
          {existingCar
            ? 'Confira ou altere os dados do seu veículo.'
            : 'Compartilhe o caminho e ajude mais pessoas a chegar.'}
        </Text>
      </View>

      {existingCar && (
        <View style={styles.savedBanner}>
          <Ionicons name="checkmark-circle" size={21} color={COLORS.success} />
          <View style={styles.savedBannerCopy}>
            <Text style={styles.savedBannerTitle}>Veículo cadastrado</Text>
            <Text style={styles.savedBannerText}>
              Os dados abaixo estão salvos neste dispositivo.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.formCard}>
        <Field
          label="Modelo do carro"
          value={model}
          onChangeText={setModel}
          placeholder="Ex.: Honda Civic"
          icon="car-outline"
        />
        <Field
          label="Placa"
          value={plate}
          onChangeText={(value: string) => setPlate(value.toUpperCase())}
          placeholder="ABC-1D23"
          autoCapitalize="characters"
          icon="card-outline"
        />
        <Field
          label="Vagas disponíveis"
          value={capacity}
          onChangeText={(value: string) =>
            setCapacity(value.replace(/\D/g, '').slice(0, 1))
          }
          placeholder="Até 4 passageiros"
          keyboardType="number-pad"
          icon="people-outline"
        />

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.navyLight}
          />
          <Text style={styles.infoText}>
            A placa será usada apenas para identificação durante a carona. Seus
            dados ficam protegidos.
          </Text>
        </View>

        <PrimaryButton
          label={
            saving
              ? 'Salvando...'
              : existingCar
              ? 'Atualizar carro'
              : 'Salvar carro'
          }
          onPress={submit}
          disabled={saving}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  pageContent: {
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  formIntro: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  orangeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 122, 26, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  savedBanner: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    gap: 12,
  },
  savedBannerCopy: {
    flex: 1,
  },
  savedBannerTitle: {
    color: '#065f46',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  savedBannerText: {
    color: '#047857',
    fontSize: 12,
  },
  formCard: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.navy,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eef2f6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    color: COLORS.navyLight,
    fontSize: 12,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});