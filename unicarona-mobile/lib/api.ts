import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cliente HTTP único do app. Toda tela fala com o backend por aqui, o que
 * concentra num lugar só: base URL, token JWT, parsing e tradução de erro.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? 'http://localhost:3000';

const CHAVE_TOKEN = 'unicarona.accessToken';
const CHAVE_USUARIO = 'unicarona.user';

let tokenEmMemoria: string | null = null;

/** Disparado quando a API responde 401 — o App volta para o login. */
type OuvinteSessaoExpirada = () => void;
let aoExpirarSessao: OuvinteSessaoExpirada | null = null;

export function registrarSessaoExpirada(ouvinte: OuvinteSessaoExpirada | null) {
  aoExpirarSessao = ouvinte;
}

export const sessao = {
  async salvar(token: string, usuario: unknown) {
    tokenEmMemoria = token;
    await AsyncStorage.multiSet([
      [CHAVE_TOKEN, token],
      [CHAVE_USUARIO, JSON.stringify(usuario)],
    ]);
  },

  async atualizarUsuario(usuario: unknown) {
    await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  },

  async carregar<T>(): Promise<{ token: string; usuario: T } | null> {
    const [[, token], [, bruto]] = await AsyncStorage.multiGet([CHAVE_TOKEN, CHAVE_USUARIO]);
    if (!token || !bruto) return null;

    try {
      tokenEmMemoria = token;
      return { token, usuario: JSON.parse(bruto) as T };
    } catch {
      await sessao.limpar();
      return null;
    }
  },

  async limpar() {
    tokenEmMemoria = null;
    await AsyncStorage.multiRemove([CHAVE_TOKEN, CHAVE_USUARIO]);
  },

  token: () => tokenEmMemoria,
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detalhes?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * O backend valida com class-validator e devolve mensagens técnicas em inglês.
 * Aqui elas viram texto que faz sentido para o estudante na tela.
 */
export function mensagemAmigavel(bruta: unknown, padrao: string): string {
  const texto = Array.isArray(bruta) ? bruta.join(' ') : String(bruta ?? '');
  const minusculo = texto.toLowerCase();

  const regras: [string, string][] = [
    ['email must be an email', 'Informe um e-mail válido.'],
    ['email should not be empty', 'Informe seu e-mail institucional.'],
    ['senha should not be empty', 'Informe sua senha.'],
    ['senha must be longer than or equal to 8', 'A senha deve ter pelo menos 8 caracteres.'],
    ['cpf should not be empty', 'Informe seu CPF.'],
    ['cpf must be', 'Informe um CPF válido.'],
    ['nome should not be empty', 'Informe seu nome.'],
    ['network request failed', 'Não foi possível conectar ao servidor. Verifique sua conexão.'],
    ['failed to fetch', 'Não foi possível conectar ao servidor. Verifique sua conexão.'],
    ['unauthorized', 'Sua sessão expirou. Entre novamente.'],
  ];

  for (const [gatilho, amigavel] of regras) {
    if (minusculo.includes(gatilho)) return amigavel;
  }

  return texto || padrao;
}

interface OpcoesRequisicao extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Rotas públicas (login, cadastro) não anexam o token. */
  publico?: boolean;
}

async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { body, publico, headers, ...resto } = opcoes;

  const cabecalhos: Record<string, string> = {
    'Content-Type': 'application/json',
    // Útil quando o backend é exposto via ngrok durante o desenvolvimento.
    'ngrok-skip-browser-warning': 'true',
    ...((headers as Record<string, string>) ?? {}),
  };

  if (!publico) {
    const token = tokenEmMemoria ?? (await AsyncStorage.getItem(CHAVE_TOKEN));
    if (token) {
      tokenEmMemoria = token;
      cabecalhos.Authorization = `Bearer ${token}`;
    }
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_BASE_URL}${caminho}`, {
      ...resto,
      headers: cabecalhos,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (erro) {
    throw new ApiError(
      mensagemAmigavel(erro instanceof Error ? erro.message : '', 'Servidor indisponível.'),
      0,
    );
  }

  const texto = await resposta.text();
  let dados: any = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = { message: texto };
  }

  if (!resposta.ok) {
    if (resposta.status === 401) {
      await sessao.limpar();
      aoExpirarSessao?.();
    }

    throw new ApiError(
      mensagemAmigavel(dados?.message, `Não foi possível concluir a operação (${resposta.status}).`),
      resposta.status,
      dados,
    );
  }

  return dados as T;
}

function comQuery(caminho: string, query?: Record<string, unknown>): string {
  if (!query) return caminho;

  const partes: string[] = [];
  for (const [chave, valor] of Object.entries(query)) {
    if (valor === undefined || valor === null || valor === '') continue;
    if (Array.isArray(valor)) {
      valor.forEach((item) => partes.push(`${encodeURIComponent(chave)}=${encodeURIComponent(String(item))}`));
    } else {
      partes.push(`${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`);
    }
  }

  return partes.length ? `${caminho}?${partes.join('&')}` : caminho;
}

export const api = {
  get: <T>(caminho: string, query?: Record<string, unknown>, publico = false) =>
    requisitar<T>(comQuery(caminho, query), { method: 'GET', publico }),
  post: <T>(caminho: string, body?: unknown, publico = false) =>
    requisitar<T>(caminho, { method: 'POST', body, publico }),
  patch: <T>(caminho: string, body?: unknown) =>
    requisitar<T>(caminho, { method: 'PATCH', body }),
  delete: <T>(caminho: string) => requisitar<T>(caminho, { method: 'DELETE' }),
};
