import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, NomeIcone } from './Icon';
import { colors, radius, spacing, tints, typography } from '../theme';
import type { Rota } from '../state/NavigationContext';

interface Aviso {
  texto: string;
  rota: Rota;
}

// ⚠️ Confirme os nomes das rotas (ver NavigationContext)
const AVISOS: Aviso[] = [
  { texto: '🎓 Semana acadêmica: caronas com 50% de desconto', rota: 'find-ride' },
  { texto: '🚗 Novo trajeto disponível: Campus Sul → Centro', rota: 'find-ride' },
  { texto: '📢 Cadastre seu veículo e ganhe R$ 10 de bônus', rota: 'car' },
];

export function AnnouncementBar({ onNavegar }: { onNavegar: (rota: Rota) => void }) {
  const deslocamento = useRef(new Animated.Value(0)).current;
  const [larguraConjunto, setLarguraConjunto] = useState(0);

  useEffect(() => {
    if (larguraConjunto === 0) return;
    deslocamento.setValue(0);
    const animacao = Animated.loop(
      Animated.timing(deslocamento, {
        toValue: 1,
        duration: larguraConjunto * 20, // ~50px por segundo
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [deslocamento, larguraConjunto]);

  const translateX = deslocamento.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -larguraConjunto],
  });

  const renderConjunto = (sufixo: string, medir: boolean) => (
    <View
      style={estilos.conjunto}
      onLayout={medir ? (e) => setLarguraConjunto(e.nativeEvent.layout.width) : undefined}
    >
      {AVISOS.map((aviso, indice) => (
        <Pressable
          key={`${sufixo}-${indice}`}
          onPress={() => onNavegar(aviso.rota)}
          accessibilityRole="link"
          accessibilityLabel={aviso.texto}
          hitSlop={8}
        >
          <Text style={estilos.avisoTexto} numberOfLines={1}>
            {aviso.texto}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={estilos.avisos}>
      <Animated.View style={[estilos.avisosTrilha, { transform: [{ translateX }] }]}>
        {renderConjunto('a', true)}
        {renderConjunto('b', false)}
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
avisos: { backgroundColor: colors.navy, paddingVertical: spacing.md, overflow: 'hidden' },
avisosTrilha: { flexDirection: 'row', width: 10000, paddingLeft: spacing.lg },
conjunto: { flexDirection: 'row', gap: spacing.xxl, paddingRight: spacing.xxl },
avisoTexto: {
  ...typography.caption,
  fontSize: 22,
  fontWeight: '700',
  color: tints.onNavyText,
},

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
  navLabel: { ...typography.caption, fontWeight: '700' },
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
