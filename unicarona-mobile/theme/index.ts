/**
 * Tokens do design system UniCarona, portados do protótipo web
 * (DESIGN_SYSTEM.md). São a única fonte de cor, espaçamento e raio do app:
 * nenhuma tela deve escrever um hex literal.
 */

export const colors = {
  navy: '#0B2A4A',
  navyLight: '#1A4570',
  navyDark: '#061929',

  orange: '#F28C18',
  orangeLight: '#FFA940',
  orangeDark: '#D97706',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  muted: '#F1F5F9',
  inputBackground: '#F8FAFC',
  border: '#E2E8F0',

  foreground: '#0B2A4A',
  mutedForeground: '#64748B',

  destructive: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',

  white: '#FFFFFF',
} as const;

/** Versões translúcidas usadas em ícones circulares e badges. */
export const tints = {
  orange: 'rgba(242, 140, 24, 0.12)',
  navy: 'rgba(11, 42, 74, 0.10)',
  success: 'rgba(16, 185, 129, 0.12)',
  destructive: 'rgba(220, 38, 38, 0.10)',
  onNavy: 'rgba(255, 255, 255, 0.10)',
  onNavyText: 'rgba(255, 255, 255, 0.72)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.6 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  h3: { fontSize: 20, fontWeight: '700' as const },
  title: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  smallMedium: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
} as const;

/** Sombra suave usada só em elementos que flutuam sobre o conteúdo. */
export const shadow = {
  card: {
    shadowColor: '#0B2A4A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B2A4A',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;

/** Largura máxima do protótipo (28rem) — mantém o layout mobile no web/tablet. */
export const MAX_WIDTH = 448;
