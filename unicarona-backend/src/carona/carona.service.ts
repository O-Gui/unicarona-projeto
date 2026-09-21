import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusCarona, StatusSolicitacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { USUARIO_RESUMO } from '../usuario/usuario.service';
import { resolverCoordenada } from '../common/locais';
import { RotaRepository } from './rota.repository';
import { CriarCaronaDto } from './dto/criar-carona.dto';
import { BuscarCaronaDto } from './dto/buscar-carona.dto';

const RAIO_PADRAO_METROS = 3000;

const CARONA_INCLUDE = {
  rota: {
    select: {
      id: true,
      origemNome: true,
      origemEndereco: true,
      destinoNome: true,
      destinoEndereco: true,
      usuario: { select: USUARIO_RESUMO },
    },
  },
  veiculo: { select: { id: true, modelo: true, placa: true, cor: true, capacidadeVagas: true } },
  solicitacoes: {
    where: { status: StatusSolicitacao.ACEITA },
    select: { id: true, vagas: true, passageiro: { select: USUARIO_RESUMO } },
  },
} satisfies Prisma.CaronaInclude;

@Injectable()
export class CaronaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rotaRepository: RotaRepository,
  ) {}

  /** OfferRideScreen: cria a rota (PostGIS) e a carona em cima dela. */
  async criar(usuarioId: string, dto: CriarCaronaDto) {
    const origem = resolverCoordenada(dto.origemNome, dto.origemLat, dto.origemLng, dto.origemEndereco);
    const destino = resolverCoordenada(
      dto.destinoNome,
      dto.destinoLat,
      dto.destinoLng,
      dto.destinoEndereco,
    );

    if (!origem || !destino) {
      throw new BadRequestException(
        'Não reconhecemos um dos locais. Escolha um ponto da lista ou envie latitude e longitude.',
      );
    }

    const partida = new Date(dto.dataHoraPartida);
    if (Number.isNaN(partida.getTime())) {
      throw new BadRequestException('Data e hora de partida inválidas.');
    }
    if (partida.getTime() < Date.now() - 60_000) {
      throw new BadRequestException('A partida precisa ser em um horário futuro.');
    }

    let veiculoId = dto.veiculoId ?? null;
    if (veiculoId) {
      const veiculo = await this.prisma.veiculo.findUnique({ where: { id: veiculoId } });
      if (!veiculo || veiculo.usuarioId !== usuarioId) {
        throw new BadRequestException('Veículo não encontrado para este usuário.');
      }
      if (dto.vagas > veiculo.capacidadeVagas) {
        throw new BadRequestException(
          `Seu veículo comporta no máximo ${veiculo.capacidadeVagas} passageiros.`,
        );
      }
    } else {
      const principal = await this.prisma.veiculo.findFirst({ where: { usuarioId } });
      veiculoId = principal?.id ?? null;
    }

    const rotaId = await this.rotaRepository.criar({
      usuarioId,
      origemNome: dto.origemNome,
      origemEndereco: origem.endereco,
      origemLat: origem.lat,
      origemLng: origem.lng,
      destinoNome: dto.destinoNome,
      destinoEndereco: destino.endereco,
      destinoLat: destino.lat,
      destinoLng: destino.lng,
    });

    const carona = await this.prisma.carona.create({
      data: {
        rotaId,
        veiculoId,
        dataHoraPartida: partida,
        vagasTotais: dto.vagas,
        vagasDisponiveis: dto.vagas,
        precoPorPassageiro: new Prisma.Decimal(dto.precoPorPassageiro),
        observacoes: dto.observacoes,
        preferencias: dto.preferencias ?? [],
      },
      include: CARONA_INCLUDE,
    });

    return this.formatar(carona);
  }

  /** FindRideScreen + AdvancedSearchScreen. */
  async buscar(usuarioId: string, filtros: BuscarCaronaDto) {
    const origem = filtros.origem
      ? resolverCoordenada(filtros.origem, filtros.origemLat, filtros.origemLng)
      : filtros.origemLat != null && filtros.origemLng != null
        ? { lat: filtros.origemLat, lng: filtros.origemLng }
        : null;

    const destino = filtros.destino
      ? resolverCoordenada(filtros.destino, filtros.destinoLat, filtros.destinoLng)
      : filtros.destinoLat != null && filtros.destinoLng != null
        ? { lat: filtros.destinoLat, lng: filtros.destinoLng }
        : null;

    const idsRota = await this.rotaRepository.idsProximos({
      origemLat: origem?.lat,
      origemLng: origem?.lng,
      destinoLat: destino?.lat,
      destinoLng: destino?.lng,
      raioMetros: filtros.raioMetros ?? RAIO_PADRAO_METROS,
    });

    // Filtro geográfico pedido, mas nenhuma rota bate: resultado vazio.
    if (idsRota !== null && idsRota.length === 0) return [];

    // Nunca devolvemos a carona do próprio usuário na busca.
    const filtroRota: Prisma.RotaWhereInput = { usuarioId: { not: usuarioId } };
    if (filtros.apenasVerificados === 'true') {
      filtroRota.usuario = { statusVerificacao: 'APROVADA' };
    }

    const where: Prisma.CaronaWhereInput = {
      status: StatusCarona.ABERTA,
      dataHoraPartida: { gte: new Date() },
      vagasDisponiveis: { gte: filtros.vagasMinimas ?? 1 },
      rota: filtroRota,
    };

    if (idsRota) where.rotaId = { in: idsRota };

    if (filtros.data) {
      const inicio = new Date(filtros.data);
      if (!Number.isNaN(inicio.getTime())) {
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(inicio);
        fim.setDate(fim.getDate() + 1);
        where.dataHoraPartida = { gte: new Date(Math.max(inicio.getTime(), Date.now())), lt: fim };
      }
    }

    if (filtros.precoMin != null || filtros.precoMax != null) {
      where.precoPorPassageiro = {
        ...(filtros.precoMin != null ? { gte: new Prisma.Decimal(filtros.precoMin) } : {}),
        ...(filtros.precoMax != null ? { lte: new Prisma.Decimal(filtros.precoMax) } : {}),
      };
    }

    if (filtros.preferencias?.length) {
      where.preferencias = { hasEvery: filtros.preferencias };
    }

    const caronas = await this.prisma.carona.findMany({
      where,
      include: CARONA_INCLUDE,
      orderBy: { dataHoraPartida: 'asc' },
      take: 60,
    });

    let resultado = await Promise.all(caronas.map((carona) => this.formatar(carona)));

    // Janela de horário e nota mínima do motorista dependem de dados derivados,
    // então são aplicadas depois da consulta.
    if (filtros.horaInicio || filtros.horaFim) {
      const minutos = (hora: string) => {
        const [h, m] = hora.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const inicio = filtros.horaInicio ? minutos(filtros.horaInicio) : 0;
      const fim = filtros.horaFim ? minutos(filtros.horaFim) : 24 * 60;

      resultado = resultado.filter((carona) => {
        const partida = new Date(carona.dataHoraPartida);
        const valor = partida.getHours() * 60 + partida.getMinutes();
        return valor >= inicio && valor <= fim;
      });
    }

    if (filtros.notaMinima != null) {
      resultado = resultado.filter((carona) => carona.motorista.avaliacaoMedia >= filtros.notaMinima!);
    }

    return resultado;
  }

  async detalhe(usuarioId: string, id: string) {
    const carona = await this.prisma.carona.findUnique({
      where: { id },
      include: {
        ...CARONA_INCLUDE,
        solicitacoes: {
          select: {
            id: true,
            status: true,
            vagas: true,
            mensagem: true,
            criadaEm: true,
            passageiro: { select: USUARIO_RESUMO },
          },
          orderBy: { criadaEm: 'asc' },
        },
      },
    });

    if (!carona) throw new NotFoundException('Carona não encontrada.');

    const formatada = await this.formatar(carona);
    const minhaSolicitacao =
      carona.solicitacoes.find((s) => s.passageiro.id === usuarioId) ?? null;

    return {
      ...formatada,
      distanciaKm: await this.rotaRepository.distanciaKm(carona.rotaId),
      souMotorista: carona.rota.usuario.id === usuarioId,
      minhaSolicitacao,
      solicitacoes: carona.solicitacoes,
    };
  }

  /** HomeScreen ("Próximas caronas") e RideHistory na aba de futuras. */
  async minhasCaronas(usuarioId: string) {
    const [comoMotorista, comoPassageiro] = await Promise.all([
      this.prisma.carona.findMany({
        where: { rota: { usuarioId }, status: { in: [StatusCarona.ABERTA, StatusCarona.LOTADA] } },
        include: CARONA_INCLUDE,
        orderBy: { dataHoraPartida: 'asc' },
      }),
      this.prisma.carona.findMany({
        where: {
          status: { in: [StatusCarona.ABERTA, StatusCarona.LOTADA] },
          solicitacoes: { some: { passageiroId: usuarioId, status: StatusSolicitacao.ACEITA } },
        },
        include: CARONA_INCLUDE,
        orderBy: { dataHoraPartida: 'asc' },
      }),
    ]);

    return {
      oferecidas: await Promise.all(comoMotorista.map((c) => this.formatar(c))),
      reservadas: await Promise.all(comoPassageiro.map((c) => this.formatar(c))),
    };
  }

  async cancelar(usuarioId: string, id: string) {
    const carona = await this.prisma.carona.findUnique({
      where: { id },
      include: { rota: { select: { usuarioId: true, origemNome: true, destinoNome: true } } },
    });

    if (!carona) throw new NotFoundException('Carona não encontrada.');
    if (carona.rota.usuarioId !== usuarioId) {
      throw new ForbiddenException('Só o motorista pode cancelar esta carona.');
    }
    if (carona.status === StatusCarona.CONCLUIDA) {
      throw new BadRequestException('Uma carona concluída não pode ser cancelada.');
    }

    const aceitas = await this.prisma.solicitacao.findMany({
      where: { caronaId: id, status: StatusSolicitacao.ACEITA },
      select: { passageiroId: true },
    });

    await this.prisma.$transaction([
      this.prisma.carona.update({ where: { id }, data: { status: StatusCarona.CANCELADA } }),
      this.prisma.solicitacao.updateMany({
        where: { caronaId: id, status: { in: [StatusSolicitacao.PENDENTE, StatusSolicitacao.ACEITA] } },
        data: { status: StatusSolicitacao.CANCELADA },
      }),
      this.prisma.notificacao.createMany({
        data: aceitas.map((s) => ({
          usuarioId: s.passageiroId,
          tipo: 'CARONA_CANCELADA' as const,
          titulo: 'Carona cancelada',
          mensagem: `A carona ${carona.rota.origemNome} → ${carona.rota.destinoNome} foi cancelada pelo motorista.`,
          referencia: id,
        })),
      }),
    ]);

    return { message: 'Carona cancelada.' };
  }

  /**
   * Encerra a carona e materializa o histórico: cria a Viagem e uma
   * Participacao por pessoa a bordo, que é o que alimenta histórico,
   * estatísticas e a tela de avaliação.
   */
  async concluir(usuarioId: string, id: string) {
    const carona = await this.prisma.carona.findUnique({
      where: { id },
      include: {
        rota: { select: { usuarioId: true } },
        solicitacoes: { where: { status: StatusSolicitacao.ACEITA } },
        viagem: true,
      },
    });

    if (!carona) throw new NotFoundException('Carona não encontrada.');
    if (carona.rota.usuarioId !== usuarioId) {
      throw new ForbiddenException('Só o motorista pode concluir esta carona.');
    }
    if (carona.viagem) throw new BadRequestException('Esta carona já foi concluída.');

    const preco = Number(carona.precoPorPassageiro);
    const totalRecebido = carona.solicitacoes.reduce((soma, s) => soma + preco * s.vagas, 0);

    const viagem = await this.prisma.viagem.create({
      data: {
        caronaId: id,
        participantes: {
          create: [
            {
              usuarioId,
              papel: 'MOTORISTA',
              valorPago: new Prisma.Decimal(totalRecebido),
            },
            ...carona.solicitacoes.map((s) => ({
              usuarioId: s.passageiroId,
              papel: 'PASSAGEIRO',
              valorPago: new Prisma.Decimal(preco * s.vagas),
            })),
          ],
        },
      },
      include: { participantes: true },
    });

    await this.prisma.carona.update({
      where: { id },
      data: { status: StatusCarona.CONCLUIDA },
    });

    return viagem;
  }

  /** RideHistoryScreen: viagens já concluídas, com ganho/gasto por linha. */
  async historico(usuarioId: string) {
    const participacoes = await this.prisma.participacao.findMany({
      where: { usuarioId },
      orderBy: { viagem: { concluidaEm: 'desc' } },
      select: {
        id: true,
        papel: true,
        valorPago: true,
        viagem: {
          select: {
            id: true,
            concluidaEm: true,
            carona: {
              select: {
                id: true,
                dataHoraPartida: true,
                precoPorPassageiro: true,
                rota: {
                  select: {
                    origemNome: true,
                    destinoNome: true,
                    usuario: { select: USUARIO_RESUMO },
                  },
                },
                solicitacoes: {
                  where: { status: StatusSolicitacao.ACEITA },
                  select: { vagas: true },
                },
              },
            },
            avaliacoes: { where: { autorId: usuarioId }, select: { id: true } },
          },
        },
      },
    });

    return participacoes.map((p) => ({
      id: p.id,
      viagemId: p.viagem.id,
      caronaId: p.viagem.carona.id,
      tipo: p.papel === 'MOTORISTA' ? ('oferecida' as const) : ('recebida' as const),
      origem: p.viagem.carona.rota.origemNome,
      destino: p.viagem.carona.rota.destinoNome,
      data: p.viagem.carona.dataHoraPartida,
      concluidaEm: p.viagem.concluidaEm,
      motorista: p.viagem.carona.rota.usuario,
      passageiros: p.viagem.carona.solicitacoes.reduce((soma, s) => soma + s.vagas, 0),
      valor: Number(p.valorPago),
      jaAvaliou: p.viagem.avaliacoes.length > 0,
    }));
  }

  /** Acrescenta motorista com média de avaliação e campos prontos de exibição. */
  private async formatar(carona: any) {
    const motoristaId = carona.rota.usuario.id;

    const agregado = await this.prisma.avaliacao.aggregate({
      where: { alvoId: motoristaId },
      _avg: { nota: true },
      _count: { _all: true },
    });

    return {
      id: carona.id,
      dataHoraPartida: carona.dataHoraPartida,
      vagasTotais: carona.vagasTotais,
      vagasDisponiveis: carona.vagasDisponiveis,
      precoPorPassageiro: Number(carona.precoPorPassageiro),
      observacoes: carona.observacoes,
      preferencias: carona.preferencias,
      status: carona.status,
      origem: {
        nome: carona.rota.origemNome,
        endereco: carona.rota.origemEndereco,
      },
      destino: {
        nome: carona.rota.destinoNome,
        endereco: carona.rota.destinoEndereco,
      },
      motorista: {
        ...carona.rota.usuario,
        avaliacaoMedia: Number((agregado._avg.nota ?? 0).toFixed(2)),
        totalAvaliacoes: agregado._count._all,
      },
      veiculo: carona.veiculo,
      passageiros: (carona.solicitacoes ?? [])
        .filter((s: any) => !s.status || s.status === StatusSolicitacao.ACEITA)
        .map((s: any) => s.passageiro),
    };
  }
}
