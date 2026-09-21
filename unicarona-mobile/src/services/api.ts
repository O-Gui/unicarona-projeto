import { COLORS } from '../constants/colors';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.2:3000';

export function friendlyErrorMessage(message: unknown, fallback: string) {
  const raw = Array.isArray(message) ? message.join(' ') : String(message ?? '');
  const lower = raw.toLowerCase();

  if (lower.includes('email must be an email')) return 'Informe um e-mail válido.';
  if (lower.includes('email should not be empty')) return 'Informe seu e-mail institucional.';
  if (lower.includes('senha should not be empty')) return 'Informe sua senha.';
  if (lower.includes('cpf should not be empty')) return 'Informe seu CPF.';
  if (lower.includes('nome should not be empty')) return 'Informe seu nome.';
  if (lower.includes('senha must be longer than or equal to 8')) return 'A senha deve ter pelo menos 8 caracteres.';
  if (lower.includes('cpf must be')) return 'Informe um CPF válido.';
  if (lower.includes('email must be')) return 'Informe um e-mail válido.';
  if (lower.includes('network request failed')) return 'Não foi possível conectar ao servidor.';
  if (lower.includes('failed to fetch')) return 'Não foi possível conectar ao servidor.';

  return raw || fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      friendlyErrorMessage(
        data?.message,
        `Não foi possível concluir a operação. Código ${response.status}.`,
      ),
    );
  }

  return data as T;
}
