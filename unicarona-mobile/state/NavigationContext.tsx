import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Navegação em pilha sem dependência externa: o projeto ainda não usa
 * react-navigation, e o protótipo trabalha com uma tela por vez. Cada entrada
 * guarda a rota e os parâmetros dela (ex.: { caronaId }).
 */
export type Rota =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'verify-email'
  | 'forgot-password'
  | 'verify-password-reset'
  | 'reset-password'
  | 'home'
  | 'find-ride'
  | 'advanced-search'
  | 'offer-ride'
  | 'ride-details'
  | 'schedule-ride'
  | 'group-ride'
  | 'profile'
  | 'car'
  | 'chat'
  | 'history'
  | 'settings'
  | 'wallet'
  | 'emergency'
  | 'notifications'
  | 'report'
  | 'rating'
  | 'analytics'
  | 'privacy-settings'
  | 'payment-methods'
  | 'campus-map';

export interface Entrada {
  rota: Rota;
  params?: Record<string, any>;
}

interface EstadoNavegacao {
  atual: Entrada;
  podeVoltar: boolean;
  navegar: (rota: Rota, params?: Record<string, any>) => void;
  /** Troca a tela atual sem empilhar (usado nos fluxos de autenticação). */
  substituir: (rota: Rota, params?: Record<string, any>) => void;
  voltar: () => void;
  /** Limpa a pilha e começa de novo — usado no login e no logout. */
  reiniciar: (rota: Rota, params?: Record<string, any>) => void;
}

const Contexto = createContext<EstadoNavegacao | null>(null);

export function NavigationProvider({
  inicial = 'splash',
  children,
}: {
  inicial?: Rota;
  children: React.ReactNode;
}) {
  const [pilha, setPilha] = useState<Entrada[]>([{ rota: inicial }]);

  const navegar = useCallback((rota: Rota, params?: Record<string, any>) => {
    setPilha((anterior) => [...anterior, { rota, params }]);
  }, []);

  const substituir = useCallback((rota: Rota, params?: Record<string, any>) => {
    setPilha((anterior) => [...anterior.slice(0, -1), { rota, params }]);
  }, []);

  const voltar = useCallback(() => {
    setPilha((anterior) => (anterior.length > 1 ? anterior.slice(0, -1) : anterior));
  }, []);

  const reiniciar = useCallback((rota: Rota, params?: Record<string, any>) => {
    setPilha([{ rota, params }]);
  }, []);

  const valor = useMemo(
    () => ({
      atual: pilha[pilha.length - 1],
      podeVoltar: pilha.length > 1,
      navegar,
      substituir,
      voltar,
      reiniciar,
    }),
    [pilha, navegar, substituir, voltar, reiniciar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useNavigation() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useNavigation precisa estar dentro de <NavigationProvider>.');
  return contexto;
}
