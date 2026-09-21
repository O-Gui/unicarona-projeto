import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import { useNavigation } from '../state/NavigationContext';

/** Marca de entrada do app. Avança sozinha depois de um instante. */
export function SplashScreen() {
  const { substituir } = useNavigation();
  const surgir = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(surgir, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const temporizador = setTimeout(() => substituir('onboarding'), 2200);
    return () => clearTimeout(temporizador);
  }, [surgir, substituir]);

  return (
    <View style={estilos.tela}>
      <Animated.View style={[estilos.conteudo, { opacity: surgir }]}>
        <View style={estilos.halo}>
          <Icon name="car" size={72} color={colors.orange} />
        </View>
        <Text style={estilos.titulo}>UniCarona</Text>
        <Text style={estilos.subtitulo}>Compartilhe caronas com sua universidade</Text>
      </Animated.View>

      <Pressable style={estilos.botao} onPress={() => substituir('onboarding')}>
        <Text style={estilos.botaoTexto}>Começar</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  conteudo: { alignItems: 'center', gap: spacing.lg },
  halo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: tints.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: 36, fontWeight: '700', color: colors.white, letterSpacing: -0.8 },
  subtitulo: { ...typography.small, color: tints.onNavyText, textAlign: 'center' },
  botao: {
    position: 'absolute',
    bottom: 48,
    minWidth: 180,
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { ...typography.bodyMedium, color: colors.white, fontWeight: '700' },
});
