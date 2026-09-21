import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { styles } from '../theme/styles';

export function Field({ label, value, onChangeText, placeholder, icon, rightIcon, onRightIconPress, ...props }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={20} color={COLORS.muted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A9B6C2"
          {...props}
        />
        <Pressable disabled={!onRightIconPress} onPress={onRightIconPress} style={styles.inputAction}>
          {rightIcon && <Ionicons name={rightIcon} size={20} color={COLORS.muted} />}
        </Pressable>
      </View>
    </View>
  );
}

