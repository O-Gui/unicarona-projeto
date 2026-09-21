/** Contratos devolvidos pelo backend, espelhando os services do NestJS. */

export type Perfil = 'PASSAGEIRO' | 'MOTORISTA' | 'AMBOS';
export type StatusVerificacao = 'NAO_ENVIADA' | 'PENDENTE' | 'APROVADA' | 'RECUSADA';
export type StatusCarona = 'ABERTA' | 'LOTADA' | 'CANCELADA' | 'CONCLUIDA';
export type StatusSolicitacao = 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CANCELADA';

export interface UsuarioResumo {
  id: string;
  nome: string;
  email?: string;
  curso?: string | null;
  fotoUrl?: string | null;
  statusVerificacao?: StatusVerificacao;
}

export interface Usuario extends UsuarioResumo {
  cpf: string;
  perfil: Perfil;
  emailValidado: boolean;
  universidade?: string | null;
  telefone?: string | null;
  bio?: string | null;
  preferencias?: string[];
  criadoEm?: string;
}

export interface Estatisticas {
  totalViagens: number;
  caronasOferecidas: number;
  caronasRecebidas: number;
  totalGanho: number;
  totalGasto: number;
  co2EvitadoKg: number;
  rotasFrequentes: { rota: string; vezes: number }[];
}

export interface PerfilCompleto extends Usuario {
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  estatisticas: Estatisticas;
  veiculos?: Veiculo[];
}

export interface Veiculo {
  id: string;
  usuarioId: string;
  modelo: string;
  placa: string;
  capacidadeVagas: number;
  cor?: string | null;
  ano?: number | null;
}

export interface Ponto {
  nome: string;
  endereco?: string | null;
}

export interface Motorista extends UsuarioResumo {
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

export interface Carona {
  id: string;
  dataHoraPartida: string;
  vagasTotais: number;
  vagasDisponiveis: number;
  precoPorPassageiro: number;
  observacoes?: string | null;
  preferencias: string[];
  status: StatusCarona;
  origem: Ponto;
  destino: Ponto;
  motorista: Motorista;
  veiculo?: Veiculo | null;
  passageiros: UsuarioResumo[];
}

export interface Solicitacao {
  id: string;
  status: StatusSolicitacao;
  vagas: number;
  mensagem?: string | null;
  criadaEm: string;
  passageiro: UsuarioResumo;
}

export interface CaronaDetalhe extends Carona {
  distanciaKm: number | null;
  souMotorista: boolean;
  minhaSolicitacao: Solicitacao | null;
  solicitacoes: Solicitacao[];
}

export interface ItemHistorico {
  id: string;
  viagemId: string;
  caronaId: string;
  tipo: 'oferecida' | 'recebida';
  origem: string;
  destino: string;
  data: string;
  concluidaEm: string;
  motorista: UsuarioResumo;
  passageiros: number;
  valor: number;
  jaAvaliou: boolean;
}

export type TipoNotificacao =
  | 'SOLICITACAO_CARONA'
  | 'SOLICITACAO_RESPONDIDA'
  | 'CARONA_CANCELADA'
  | 'LEMBRETE_CARONA'
  | 'NOVA_AVALIACAO'
  | 'VERIFICACAO'
  | 'MENSAGEM';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  referencia?: string | null;
  criadaEm: string;
}

export interface Conversa {
  id: string;
  contato: UsuarioResumo;
  carona: { id: string; trajeto: string } | null;
  ultimaMensagem: { texto: string; enviadaEm: string } | null;
  naoLidas: number;
  atualizadaEm: string;
}

export interface Mensagem {
  id: string;
  texto: string;
  enviadaEm: string;
  minha: boolean;
  autor: UsuarioResumo;
}

export interface Avaliacao {
  id: string;
  nota: number;
  comentario?: string | null;
  tags: string[];
  criadaEm: string;
  autor: UsuarioResumo;
}

export interface Local {
  nome: string;
  lat: number;
  lng: number;
  endereco?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  usuario: Usuario;
}
