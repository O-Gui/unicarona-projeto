import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { notificacaoService } from './servicos';

/** Consulta o backend a cada poucos segundos e quando o app volta ao primeiro plano. */
export function useNaoLidas(intervaloMs = 5000) {
  const [contagem, setContagem] = useState({ todas: 0, mensagens: 0 });

  const atualizar = useCallback(async () => {
    try {
      const resposta = await notificacaoService.naoLidas();
      setContagem({ todas: resposta.todas ?? resposta.total, mensagens: resposta.total });
    } catch {
      // Sem rede ou servidor fora: mantém o número anterior.
    }
  }, []);

  useEffect(() => {
    atualizar();
    const timer = setInterval(atualizar, intervaloMs);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });

    return () => {
      clearInterval(timer);
      assinatura.remove();
    };
  }, [atualizar, intervaloMs]);

  return { ...contagem, atualizar };
}