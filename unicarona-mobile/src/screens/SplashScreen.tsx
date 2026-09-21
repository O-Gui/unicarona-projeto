import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { styles } from '../theme/styles';

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <View style={styles.splashScreen}>
      <View style={styles.splashContent}>
        <View style={styles.splashIcon}>
          <Ionicons
            name="car-sport"
            size={64}
            color={COLORS.orange}
          />
        </View>

        <Text style={styles.splashTitle}>
          UniCarona
        </Text>

        <Text style={styles.splashSubtitle}>
          Compartilhe caronas com sua universidade
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.splashButton,
          pressed && styles.pressed,
        ]}
        onPress={onComplete}
      >
        <Text style={styles.splashButtonText}>
          Começar
        </Text>

        <Ionicons
          name="arrow-forward"
          size={19}
          color={COLORS.white}
        />
      </Pressable>
    </View>
  );
}

