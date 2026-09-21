/** Formatações usadas pelas telas. Tudo em pt-BR. */

export function formatarMoeda(valor: number | string | null | undefined): string {
  const numero = Number(valor ?? 0);
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

export function iniciais(nome?: string | null): string {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export function primeiroNome(nome?: string | null): string {
  if (!nome) return '';
  return nome.trim().split(/\s+/)[0];
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatarData(valor: string | Date): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '--';
  return `${String(data.getDate()).padStart(2, '0')} ${MESES[data.getMonth()]}`;
}

export function formatarDataCompleta(valor: string | Date): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '--';
  return `${String(data.getDate()).padStart(2, '0')} ${MESES[data.getMonth()]}, ${data.getFullYear()}`;
}

export function formatarHora(valor: string | Date): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '--:--';
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

/** "5 min atrás", "Ontem" — usado na lista de notificações e no chat. */
export function tempoRelativo(valor: string | Date): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const segundos = Math.floor((Date.now() - data.getTime()) / 1000);
  if (segundos < 60) return 'agora';
  if (segundos < 3600) return `${Math.floor(segundos / 60)} min atrás`;
  if (segundos < 86400) {
    const horas = Math.floor(segundos / 3600);
    return `${horas} hora${horas > 1 ? 's' : ''} atrás`;
  }
  if (segundos < 172800) return 'Ontem';
  if (segundos < 604800) return `${Math.floor(segundos / 86400)} dias atrás`;
  return formatarData(data);
}

/** Converte "01/05/2026" ou "2026-05-01" + "08:30" em ISO para a API. */
export function paraIso(data: string, hora: string): string | null {
  const limpaData = data.trim();
  const limpaHora = (hora.trim() || '00:00').padEnd(5, '0');

  let ano: number, mes: number, dia: number;

  if (/^\d{4}-\d{2}-\d{2}$/.test(limpaData)) {
    [ano, mes, dia] = limpaData.split('-').map(Number);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(limpaData)) {
    [dia, mes, ano] = limpaData.split('/').map(Number);
  } else {
    return null;
  }

  const [horas, minutos] = limpaHora.split(':').map(Number);
  if ([ano, mes, dia, horas, minutos].some((n) => Number.isNaN(n))) return null;

  const resultado = new Date(ano, mes - 1, dia, horas, minutos);
  return Number.isNaN(resultado.getTime()) ? null : resultado.toISOString();
}

/** Máscaras de digitação dos formulários. */
export const mascaras = {
  cpf: (valor: string) => valor.replace(/\D/g, '').slice(0, 11),
  placa: (valor: string) => valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7),
  data: (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  },
  hora: (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 4);
    if (numeros.length <= 2) return numeros;
    return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
  },
  telefone: (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  },
};
