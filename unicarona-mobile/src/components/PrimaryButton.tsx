import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../theme/styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
    </Pressable>
  );
}

