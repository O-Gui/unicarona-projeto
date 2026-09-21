import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './api';

/**
 * Busca dados da API com os três estados que toda tela precisa tratar:
 * carregando, erro e conteúdo. Evita repetir try/catch em cada componente.
 */
export function useCarregar<T>(
  buscar: () => Promise<T>,
  dependencias: unknown[] = [],
): {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  definir: (dados: T) => void;
} {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const executar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      setDados(await buscar());
    } catch (falha) {
      setErro(
        falha instanceof ApiError || falha instanceof Error
          ? falha.message
          : 'Erro inesperado ao falar com o servidor.',
      );
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    void executar();
  }, [executar]);

  return { dados, carregando, erro, recarregar: executar, definir: setDados };
}
