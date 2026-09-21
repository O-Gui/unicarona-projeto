import { api } from './api';
import type {
  Avaliacao,
  AuthResponse,
  Carona,
  CaronaDetalhe,
  Conversa,
  Estatisticas,
  ItemHistorico,
  Local,
  Mensagem,
  Notificacao,
  PerfilCompleto,
  Solicitacao,
  Usuario,
  Veiculo,
} from './tipos';

/**
 * Um método por endpoint do backend. As telas chamam estes serviços em vez de
 * montar URLs à mão, então mudar uma rota do NestJS é uma edição só.
 */

export const authService = {
  login: (email: string, senha: string) =>
    api.post<AuthResponse>('/auth/login', { email, senha }, true),

  registrar: (dados: {
    nome: string;
    email: string;
    cpf: string;
    senha: string;
    curso?: string;
    universidade?: string;
  }) => api.post<{ message: string; usuario: Usuario }>('/auth/register', dados, true),

  verificarEmail: (email: string, codigo: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, codigo }, true),

  reenviarCodigo: (email: string) =>
    api.post<{ message: string }>('/auth/resend-verification', { email }, true),

  esqueciSenha: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }, true),

  verificarCodigoSenha: (email: string, codigo: string) =>
    api.post<{ message: string }>('/auth/verify-password-reset', { email, codigo }, true),

  redefinirSenha: (email: string, codigo: string, novaSenha: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email, codigo, novaSenha }, true),

  eu: () => api.get<Usuario>('/auth/me'),
};

export const usuarioService = {
  meuPerfil: () => api.get<PerfilCompleto>('/usuarios/me'),

  atualizar: (dados: Partial<Usuario>) => api.patch<Usuario>('/usuarios/me', dados),

  estatisticas: () => api.get<Estatisticas>('/usuarios/me/estatisticas'),

  perfilPublico: (id: string) => api.get<PerfilCompleto>(`/usuarios/${id}`),

  avaliacoes: (id: string) => api.get<Avaliacao[]>(`/usuarios/${id}/avaliacoes`),

  statusVerificacao: () =>
    api.get<{ statusVerificacao: string; documentos: { tipo: string; enviadoEm: string }[] }>(
      '/usuarios/me/verificacao',
    ),

};

export const veiculoService = {
  principal: () => api.get<Veiculo | null>('/veiculos/me'),
  listar: () => api.get<Veiculo[]>('/veiculos'),
  salvar: (dados: { modelo: string; placa: string; capacidade: number; cor?: string; ano?: number }) =>
    api.post<Veiculo>('/veiculos', dados),
  remover: (id: string) => api.delete<{ message: string }>(`/veiculos/${id}`),
};

export interface FiltrosBusca {
  origem?: string;
  destino?: string;
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  precoMin?: number;
  precoMax?: number;
  vagasMinimas?: number;
  notaMinima?: number;
  preferencias?: string[];
  apenasVerificados?: boolean;
}

export const caronaService = {
  locais: () => api.get<Local[]>('/caronas/locais'),

  buscar: (filtros: FiltrosBusca = {}) =>
    api.get<Carona[]>('/caronas', {
      ...filtros,
      apenasVerificados: filtros.apenasVerificados ? 'true' : undefined,
    }),

  minhas: () => api.get<{ oferecidas: Carona[]; reservadas: Carona[] }>('/caronas/minhas'),

  historico: () => api.get<ItemHistorico[]>('/caronas/historico'),

  detalhe: (id: string) => api.get<CaronaDetalhe>(`/caronas/${id}`),

  criar: (dados: {
  origemNome: string;
  origemEndereco?: string;
  origemLat?: number;
  origemLng?: number;
  destinoNome: string;
  destinoEndereco?: string;
  destinoLat?: number;
  destinoLng?: number;
  dataHoraPartida: string;
  vagas: number;
  precoPorPassageiro: number;
  veiculoId?: string;
  observacoes?: string;
  preferencias?: string[];
}) => api.post<Carona>('/caronas', dados),

  cancelar: (id: string) => api.patch<{ message: string }>(`/caronas/${id}/cancelar`),

  concluir: (id: string) => api.patch<{ id: string }>(`/caronas/${id}/concluir`),
};

export const solicitacaoService = {
  criar: (caronaId: string, vagas = 1, mensagem?: string) =>
    api.post<Solicitacao>('/solicitacoes', { caronaId, vagas, mensagem }),

  minhas: () => api.get<any[]>('/solicitacoes/minhas'),

  recebidas: () => api.get<any[]>('/solicitacoes/recebidas'),

  responder: (id: string, status: 'ACEITA' | 'RECUSADA') =>
    api.patch<Solicitacao>(`/solicitacoes/${id}/responder`, { status }),

  cancelar: (id: string) => api.patch<{ message: string }>(`/solicitacoes/${id}/cancelar`),
};

export const avaliacaoService = {
  criar: (dados: {
    viagemId: string;
    alvoId: string;
    nota: number;
    comentario?: string;
    categorias?: Record<string, number>;
    tags?: string[];
  }) => api.post<Avaliacao>('/avaliacoes', dados),

  pendentes: (viagemId: string) =>
    api.get<{
      viagemId: string;
      trajeto: string;
      pendentes: (import('./tipos').UsuarioResumo & { papel: string })[];
    }>(`/avaliacoes/viagem/${viagemId}/pendentes`),

  resumo: (usuarioId: string) =>
    api.get<{
      media: number;
      total: number;
      distribuicao: Record<string, number>;
      categorias: Record<string, number>;
    }>(`/avaliacoes/resumo/${usuarioId}`),
};

export const notificacaoService = {
  listar: (grupo?: string) =>
    api.get<{ itens: Notificacao[]; naoLidas: number }>('/notificacoes', { grupo }),

  naoLidas: () => api.get<{ total: number }>('/notificacoes/nao-lidas'),

  ler: (id: string) => api.patch<Notificacao>(`/notificacoes/${id}/ler`),

  lerTodas: () => api.patch<{ message: string }>('/notificacoes/ler-todas'),
};

export const chatService = {
  conversas: () => api.get<Conversa[]>('/conversas'),

  mensagens: (conversaId: string) =>
    api.get<{ conversaId: string; contato: import('./tipos').UsuarioResumo; mensagens: Mensagem[] }>(
      `/conversas/${conversaId}/mensagens`,
    ),

  abrir: (destinatarioId: string, caronaId?: string) =>
    api.post<{ conversaId: string }>('/conversas/abrir', { destinatarioId, caronaId }),

  enviar: (dados: { conversaId?: string; destinatarioId?: string; caronaId?: string; texto: string }) =>
    api.post<Mensagem & { conversaId: string }>('/conversas/mensagens', dados),
};

export const denunciaService = {
  criar: (dados: {
    motivo: string;
    descricao: string;
    alvoId?: string;
    caronaId?: string;
    anonima?: boolean;
  }) => api.post<{ id: string; status: string; message: string }>('/denuncias', dados),

  minhas: () =>
    api.get<
      { id: string; motivo: string; descricao: string; status: string; criadaEm: string }[]
    >('/denuncias/minhas'),
};
