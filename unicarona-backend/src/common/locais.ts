/**
 * Catálogo de locais conhecidos da comunidade UniCarona.
 *
 * As telas de buscar/oferecer carona trabalham com nomes de lugares digitados
 * pelo usuário ("Centro", "Campus Norte"). O banco, porém, guarda pontos
 * geográficos do PostGIS. Este catálogo faz a ponte entre os dois: resolve um
 * texto livre para coordenadas, sem depender de um serviço externo de
 * geocodificação. O app também pode enviar lat/lng explícitos, que têm
 * prioridade sobre o catálogo.
 */

export interface Local {
  nome: string;
  apelidos: string[];
  lat: number;
  lng: number;
  endereco?: string;
}

export const LOCAIS: Local[] = [
  {
    nome: 'Campus UCB Taguatinga',
    apelidos: ['ucb', 'campus', 'campus principal', 'universidade', 'catolica', 'taguatinga'],
    lat: -15.8377,
    lng: -48.0257,
    endereco: 'QS 07 Lote 01, EPCT, Taguatinga',
  },
  {
    nome: 'Campus Norte',
    apelidos: ['campus norte', 'norte'],
    lat: -15.7631,
    lng: -47.8701,
    endereco: 'Campus Universitário Darcy Ribeiro, Asa Norte',
  },
  {
    nome: 'Centro',
    apelidos: ['centro', 'plano piloto', 'rodoviaria', 'setor central'],
    lat: -15.7942,
    lng: -47.8822,
    endereco: 'Rodoviária do Plano Piloto, Brasília',
  },
  {
    nome: 'Asa Sul',
    apelidos: ['asa sul', 'zona sul', 'sul'],
    lat: -15.8267,
    lng: -47.9218,
    endereco: 'Asa Sul, Brasília',
  },
  {
    nome: 'Asa Norte',
    apelidos: ['asa norte'],
    lat: -15.7575,
    lng: -47.8825,
    endereco: 'Asa Norte, Brasília',
  },
  {
    nome: 'Águas Claras',
    apelidos: ['aguas claras', 'zona oeste', 'oeste'],
    lat: -15.8348,
    lng: -48.0244,
    endereco: 'Águas Claras, DF',
  },
  {
    nome: 'Ceilândia',
    apelidos: ['ceilandia'],
    lat: -15.8156,
    lng: -48.1101,
    endereco: 'Ceilândia, DF',
  },
  {
    nome: 'Samambaia',
    apelidos: ['samambaia'],
    lat: -15.8753,
    lng: -48.0819,
    endereco: 'Samambaia, DF',
  },
  {
    nome: 'Guará',
    apelidos: ['guara'],
    lat: -15.8225,
    lng: -47.9756,
    endereco: 'Guará, DF',
  },
  {
    nome: 'Shopping Taguatinga',
    apelidos: ['shopping', 'shopping center', 'shopping taguatinga'],
    lat: -15.8361,
    lng: -48.0552,
    endereco: 'QSA 13, Taguatinga Sul',
  },
];

function normalizar(texto: string) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Resolve um nome digitado para um local conhecido. Faz correspondência exata
 * e depois por inclusão, para tolerar "Campus Norte - UCB" ou "centro df".
 */
export function resolverLocal(nome: string): Local | null {
  const alvo = normalizar(nome);
  if (!alvo) return null;

  for (const local of LOCAIS) {
    const chaves = [normalizar(local.nome), ...local.apelidos.map(normalizar)];
    if (chaves.includes(alvo)) return local;
  }

  for (const local of LOCAIS) {
    const chaves = [normalizar(local.nome), ...local.apelidos.map(normalizar)];
    if (chaves.some((chave) => alvo.includes(chave) || chave.includes(alvo))) return local;
  }

  return null;
}

export interface Coordenada {
  lat: number;
  lng: number;
  endereco?: string;
}

/**
 * Coordenada final de um ponto: usa lat/lng explícitos quando o app os envia,
 * senão resolve pelo catálogo. Retorna null quando não dá para posicionar.
 */
export function resolverCoordenada(
  nome: string,
  lat?: number,
  lng?: number,
  endereco?: string,
): Coordenada | null {
  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng, endereco };
  }

  const local = resolverLocal(nome);
  if (!local) return null;

  return { lat: local.lat, lng: local.lng, endereco: endereco ?? local.endereco };
}
