import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AnnouncementBar, BottomNav } from './components/AppChrome';
import { Loading } from './components/ui';
import { colors, MAX_WIDTH } from './theme';
import { notificacaoService } from './lib/servicos';
import { AuthProvider, useAuth } from './state/AuthContext';
import { NavigationProvider, useNavigation, type Rota } from './state/NavigationContext';

import { AdvancedSearchScreen } from './screens/AdvancedSearchScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { CampusMapScreen } from './screens/CampusMapScreen';
import { CarScreen } from './screens/CarScreen';
import { ChatScreen } from './screens/ChatScreen';
import { EmailVerificationScreen } from './screens/EmailVerificationScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { FindRideScreen } from './screens/FindRideScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { GroupRideScreen } from './screens/GroupRideScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { OfferRideScreen } from './screens/OfferRideScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PaymentMethodsScreen } from './screens/PaymentMethodsScreen';
import { PrivacySettingsScreen } from './screens/PrivacySettingsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RatingScreen } from './screens/RatingScreen';
import { RegistrationScreen } from './screens/RegistrationScreen';
import { ReportScreen } from './screens/ReportScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { RideDetailsScreen } from './screens/RideDetailsScreen';
import { RideHistoryScreen } from './screens/RideHistoryScreen';
import { ScheduleRideScreen } from './screens/ScheduleRideScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SplashScreen } from './screens/SplashScreen';
import { VerifyPasswordResetScreen } from './screens/VerifyPasswordResetScreen';
import { WalletScreen } from './screens/WalletScreen';

/**
 * Raiz do app. Junta sessão (AuthProvider), pilha de telas
 * (NavigationProvider) e o cromo fixo — faixa de avisos e barra inferior —
 * que o protótipo esconde nas telas de entrada.
 */

const TELAS: Record<Rota, React.ComponentType> = {
  splash: SplashScreen,
  onboarding: OnboardingScreen,
  login: LoginScreen,
  register: RegistrationScreen,
  'verify-email': EmailVerificationScreen,
  'forgot-password': ForgotPasswordScreen,
  'verify-password-reset': VerifyPasswordResetScreen,
  'reset-password': ResetPasswordScreen,  home: HomeScreen,
  'find-ride': FindRideScreen,
  'advanced-search': AdvancedSearchScreen,
  'offer-ride': OfferRideScreen,
  'ride-details': RideDetailsScreen,
  'schedule-ride': ScheduleRideScreen,
  'group-ride': GroupRideScreen,
  profile: ProfileScreen,
  car: CarScreen,
  chat: ChatScreen,
  history: RideHistoryScreen,
  settings: SettingsScreen,
  wallet: WalletScreen,
  emergency: EmergencyScreen,
  notifications: NotificationsScreen,
  report: ReportScreen,
  rating: RatingScreen,
  analytics: AnalyticsScreen,
  'privacy-settings': PrivacySettingsScreen,
  'payment-methods': PaymentMethodsScreen,
  'campus-map': CampusMapScreen,
};

/** Fluxo de entrada: sem sessão e sem cromo. */
const ROTAS_PUBLICAS: Rota[] = [
  'splash',
  'onboarding',
  'login',
  'register',
  'verify-email',
  'forgot-password',
  'verify-password-reset',
  'reset-password',
];

/** Telas internas que ocupam a tela inteira, como no protótipo. */
const SEM_CROMO: Rota[] = [...ROTAS_PUBLICAS, 'profile', 'emergency', 'rating'];

/** Abas da barra inferior — só elas ficam com o item destacado. */
const ABAS: Rota[] = ['home', 'history', 'chat', 'settings'];

function Aplicacao() {
  const { atual, navegar, reiniciar } = useNavigation();
  const { usuario, carregando } = useAuth();
  const [naoLidas, setNaoLidas] = useState(0);

  const publica = ROTAS_PUBLICAS.includes(atual.rota);

  // Sessão válida durante o fluxo de entrada: vai direto para a home.
  // Sessão ausente numa tela interna: volta para o login.
  useEffect(() => {
    if (carregando) return;

    if (usuario && (atual.rota === 'splash' || atual.rota === 'onboarding' || atual.rota === 'login')) {
      reiniciar('home');
      return;
    }

    if (!usuario && !publica) {
      reiniciar('login');
    }
  }, [carregando, usuario, atual.rota, publica, reiniciar]);

  // Badge de mensagens: recarrega a cada troca de tela, sem polling.
  const atualizarNaoLidas = useCallback(async () => {
    if (!usuario) {
      setNaoLidas(0);
      return;
    }

    try {
      const { total } = await notificacaoService.naoLidas();
      setNaoLidas(total);
    } catch {
      // Contador é informativo: falha não atrapalha a navegação.
    }
  }, [usuario]);

  useEffect(() => {
    void atualizarNaoLidas();
  }, [atualizarNaoLidas, atual.rota]);

  const Tela = useMemo(() => TELAS[atual.rota] ?? HomeScreen, [atual.rota]);
  const mostrarCromo = !SEM_CROMO.includes(atual.rota) && !!usuario;

  if (carregando) {
    return (
      <View style={estilos.fundo}>
        <Loading texto="Carregando o UniCarona..." />
      </View>
    );
  }

  return (
    <View style={estilos.fundo}>
      <View style={estilos.limite}>
        {mostrarCromo ? <AnnouncementBar /> : null}

        <View style={estilos.conteudo}>
          {/* A chave força a remontagem ao trocar de rota, zerando o estado
              local de cada tela (filtros, formulários, rolagem). */}
          <Tela key={`${atual.rota}-${JSON.stringify(atual.params ?? {})}`} />
        </View>

        {mostrarCromo ? (
          <BottomNav
            rotaAtual={ABAS.includes(atual.rota) ? atual.rota : ('' as Rota)}
            onNavegar={(rota) => (rota === atual.rota ? undefined : navegar(rota))}
            mensagensNaoLidas={naoLidas}
          />
        ) : null}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={estilos.seguro} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <AuthProvider>
          <NavigationProvider inicial="splash">
            <Aplicacao />
          </NavigationProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  seguro: { flex: 1, backgroundColor: colors.navy },
  fundo: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  limite: { flex: 1, width: '100%', maxWidth: MAX_WIDTH, backgroundColor: colors.background },
  conteudo: { flex: 1 },
});
