import React from 'react';
import { Pressable, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Icon, NomeIcone } from './Icon';
import { colors, radius, spacing, typography } from '../theme';
import type { Rota } from '../state/NavigationContext';
// Importe o seu contexto ou hook de navegação/mensagens se necessário

// --- 1. CONFIGURAÇÕES DA NAVEGAÇÃO ---
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

// --- 2. COMPONENTE BOTTOM NAV ---
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

// --- 3. SEU COMPONENTE PRINCIPAL (O Chrome) ---
// Mantive como exemplo, você deve usar o que já tem no seu projeto para encapsular as telas
export function AppChrome({ children, rotaAtual, onNavegar, mensagensNaoLidas }: any) {
  return (
    <SafeAreaView style={estilos.container}>
      {/* O conteúdo da tela atual vai aqui no meio */}
      <View style={estilos.conteudoPrincipal}>
        {children}
      </View>

      {/* A Barra de Navegação no final (sem a barra de anúncios em cima) */}
      <BottomNav 
        rotaAtual={rotaAtual} 
        onNavegar={onNavegar} 
        mensagensNaoLidas={mensagensNaoLidas} 
      />
    </SafeAreaView>
  );
}

// --- 4. ESTILOS ---
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // ajuste para a cor de fundo do seu tema
  },
  conteudoPrincipal: {
    flex: 1,
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