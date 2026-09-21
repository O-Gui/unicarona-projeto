import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registrarSessaoExpirada, sessao } from '../lib/api';
import { authService, usuarioService } from '../lib/servicos';
import type { PerfilCompleto, Usuario } from '../lib/tipos';

interface EstadoAuth {
  usuario: Usuario | null;
  perfil: PerfilCompleto | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<Usuario>;
  sair: () => Promise<void>;
  recarregarPerfil: () => Promise<PerfilCompleto | null>;
  atualizarUsuario: (parcial: Partial<Usuario>) => void;
}

const Contexto = createContext<EstadoAuth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<PerfilCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(async () => {
    await sessao.limpar();
    setUsuario(null);
    setPerfil(null);
  }, []);

  // A API avisa quando um 401 derruba a sessão; o app reage num lugar só.
  useEffect(() => {
    registrarSessaoExpirada(() => {
      setUsuario(null);
      setPerfil(null);
    });
    return () => registrarSessaoExpirada(null);
  }, []);

  // Restaura a sessão gravada e revalida o token contra o backend.
  useEffect(() => {
    (async () => {
      try {
        const guardada = await sessao.carregar<Usuario>();
        if (!guardada) return;

        setUsuario(guardada.usuario);

        try {
          const atual = await authService.eu();
          setUsuario(atual);
          await sessao.atualizarUsuario(atual);
        } catch {
          // Token expirado ou servidor fora: a sessão local já foi limpa
          // pelo cliente HTTP quando o status foi 401.
          await sair();
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, [sair]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await authService.login(email, senha);
    await sessao.salvar(resposta.accessToken, resposta.usuario);
    setUsuario(resposta.usuario);
    return resposta.usuario;
  }, []);

  const recarregarPerfil = useCallback(async () => {
    if (!sessao.token()) return null;
    const completo = await usuarioService.meuPerfil();
    setPerfil(completo);
    setUsuario((anterior) => (anterior ? { ...anterior, ...completo } : completo));
    return completo;
  }, []);

  const atualizarUsuario = useCallback((parcial: Partial<Usuario>) => {
    setUsuario((anterior) => {
      if (!anterior) return anterior;
      const proximo = { ...anterior, ...parcial };
      void sessao.atualizarUsuario(proximo);
      return proximo;
    });
  }, []);

  const valor = useMemo(
    () => ({ usuario, perfil, carregando, entrar, sair, recarregarPerfil, atualizarUsuario }),
    [usuario, perfil, carregando, entrar, sair, recarregarPerfil, atualizarUsuario],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return contexto;
}
