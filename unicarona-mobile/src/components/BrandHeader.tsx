import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { styles } from '../theme/styles';

export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandHeader, compact && styles.brandHeaderCompact]}>
      <View style={styles.brandMark}>
        <Ionicons name="car-sport" size={compact ? 20 : 28} color={COLORS.white} />
      </View>
      <View>
        <Text style={[styles.brandName, compact && styles.brandNameCompact]}>UniCarona</Text>
        {!compact && <Text style={styles.brandTagline}>conectando caminhos</Text>}
      </View>
    </View>
  );
}
