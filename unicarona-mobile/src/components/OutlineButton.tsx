import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { styles } from '../theme/styles';
import { COLORS } from '../constants/colors';

export function OutlineButton({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={19} color={COLORS.navy} />
      <Text style={styles.outlineButtonText}>{label}</Text>
    </Pressable>
  );
}

