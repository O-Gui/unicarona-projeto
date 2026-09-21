import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, NomeIcone } from './Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import type { Rota } from '../state/NavigationContext';

/**
 * Cromo fixo do app: faixa de avisos rolando e barra inferior de navegação.
 * O protótipo esconde os dois nas telas de entrada e no perfil.
 */

const AVISOS = [
  '🎓 Semana acadêmica: caronas com 50% de desconto',
  '🚗 Novo trajeto disponível: Campus Sul → Centro',
  '📢 Cadastre seu veículo e ganhe R$ 10 de bônus',
];

export function AnnouncementBar() {
  const deslocamento = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.timing(deslocamento, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [deslocamento]);

  const translateX = deslocamento.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -900],
  });

  return (
    <View style={estilos.avisos}>
      <Animated.View style={[estilos.avisosTrilha, { transform: [{ translateX }] }]}>
        {[...AVISOS, ...AVISOS].map((aviso, indice) => (
          <Text key={`${aviso}-${indice}`} style={estilos.avisoTexto}>
            {aviso}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

interface ItemNav {
  label: string;
  icone: NomeIcone;
  rota: Rota;
}

const ITENS: ItemNav[] = [
  { label: 'Início', icone: 'map-pin', rota: 'home' },
  { label: 'Histórico', icone: 'calendar', rota: 'history' },
  { label: 'Mensagens', icone: 'message-circle', rota: 'chat' },
  { label: 'Mais', icone: 'settings', rota: 'settings' },
];

export function BottomNav({
  rotaAtual,
  onNavegar,
  mensagensNaoLidas = 0,
}: {
  rotaAtual: Rota;
  onNavegar: (rota: Rota) => void;
  mensagensNaoLidas?: number;
}) {
  return (
    <View style={estilos.nav}>
      {ITENS.map((item) => {
        const ativo = item.rota === rotaAtual;
        const cor = ativo ? colors.orange : colors.mutedForeground;

        return (
          <Pressable
            key={item.rota}
            onPress={() => onNavegar(item.rota)}
            style={estilos.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
          >
            <View>
              <Icon name={item.icone} size={23} color={cor} />
              {item.rota === 'chat' && mensagensNaoLidas > 0 ? (
                <View style={estilos.navBadge}>
                  <Text style={estilos.navBadgeTexto}>
                    {mensagensNaoLidas > 9 ? '9+' : mensagensNaoLidas}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[estilos.navLabel, { color: cor }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  avisos: { backgroundColor: colors.navy, paddingVertical: spacing.sm, overflow: 'hidden' },
  avisosTrilha: { flexDirection: 'row', gap: spacing.xxl, paddingHorizontal: spacing.lg },
  avisoTexto: { ...typography.caption, fontWeight: '600', color: tints.onNavyText },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  navItem: { alignItems: 'center', gap: spacing.xs, minWidth: 64 },
  navLabel: { ...typography.caption, fontWeight: '600' },
  navBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeTexto: { fontSize: 10, fontWeight: '700', color: colors.white },
});
