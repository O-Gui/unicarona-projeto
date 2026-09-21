import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusCarona, StatusSolicitacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { USUARIO_RESUMO } from '../usuario/usuario.service';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';
import { ResponderSolicitacaoDto } from './dto/responder-solicitacao.dto';

@Injectable()
export class SolicitacaoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Botão "Reservar" da FindRideScreen / RideDetailsScreen. */
  async criar(passageiroId: string, dto: CriarSolicitacaoDto) {
    const vagas = dto.vagas ?? 1;

    const carona = await this.prisma.carona.findUnique({
      where: { id: dto.caronaId },
      include: { rota: { select: { usuarioId: true, origemNome: true, destinoNome: true } } },
    });

    if (!carona) throw new NotFoundException('Carona não encontrada.');
    if (carona.rota.usuarioId === passageiroId) {
      throw new BadRequestException('Você não pode reservar vaga na sua própria carona.');
    }
    if (carona.status !== StatusCarona.ABERTA) {
      throw new BadRequestException('Esta carona não está mais aberta.');
    }
    if (carona.vagasDisponiveis < vagas) {
      throw new BadRequestException(
        `Restam apenas ${carona.vagasDisponiveis} vaga(s) nesta carona.`,
      );
    }

    const existente = await this.prisma.solicitacao.findUnique({
      where: { passageiroId_caronaId: { passageiroId, caronaId: dto.caronaId } },
    });

    if (existente && existente.status !== StatusSolicitacao.CANCELADA) {
      throw new ConflictException('Você já tem uma solicitação para esta carona.');
    }

    const passageiro = await this.prisma.usuario.findUnique({
      where: { id: passageiroId },
      select: { nome: true },
    });

    const [solicitacao] = await this.prisma.$transaction([
      this.prisma.solicitacao.upsert({
        where: { passageiroId_caronaId: { passageiroId, caronaId: dto.caronaId } },
        update: { status: StatusSolicitacao.PENDENTE, vagas, mensagem: dto.mensagem, criadaEm: new Date() },
        create: { passageiroId, caronaId: dto.caronaId, vagas, mensagem: dto.mensagem },
        include: { passageiro: { select: USUARIO_RESUMO } },
      }),
      this.prisma.notificacao.create({
        data: {
          usuarioId: carona.rota.usuarioId,
          tipo: 'SOLICITACAO_CARONA',
          titulo: 'Nova solicitação de carona',
          mensagem: `${passageiro?.nome ?? 'Um passageiro'} quer reservar ${vagas} vaga(s) para ${carona.rota.destinoNome}.`,
          referencia: dto.caronaId,
        },
      }),
    ]);

    return solicitacao;
  }

  /** Botões "Aceitar"/"Recusar" da NotificationsScreen e do detalhe da carona. */
  async responder(motoristaId: string, id: string, dto: ResponderSolicitacaoDto) {
    const solicitacao = await this.prisma.solicitacao.findUnique({
      where: { id },
      include: {
        carona: {
          include: { rota: { select: { usuarioId: true, origemNome: true, destinoNome: true } } },
        },
      },
    });

    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.');
    if (solicitacao.carona.rota.usuarioId !== motoristaId) {
      throw new ForbiddenException('Só o motorista da carona pode responder esta solicitação.');
    }
    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new BadRequestException('Esta solicitação já foi respondida.');
    }

    const aceita = dto.status === 'ACEITA';
    if (aceita && solicitacao.carona.vagasDisponiveis < solicitacao.vagas) {
      throw new BadRequestException('Não há vagas suficientes para aceitar esta solicitação.');
    }

    const vagasRestantes = aceita
      ? solicitacao.carona.vagasDisponiveis - solicitacao.vagas
      : solicitacao.carona.vagasDisponiveis;

    const rota = solicitacao.carona.rota;

    const [atualizada] = await this.prisma.$transaction([
      this.prisma.solicitacao.update({
        where: { id },
        data: { status: aceita ? StatusSolicitacao.ACEITA : StatusSolicitacao.RECUSADA },
        include: { passageiro: { select: USUARIO_RESUMO } },
      }),
      this.prisma.carona.update({
        where: { id: solicitacao.caronaId },
        data: {
          vagasDisponiveis: vagasRestantes,
          status: vagasRestantes === 0 ? StatusCarona.LOTADA : StatusCarona.ABERTA,
        },
      }),
      this.prisma.notificacao.create({
        data: {
          usuarioId: solicitacao.passageiroId,
          tipo: 'SOLICITACAO_RESPONDIDA',
          titulo: aceita ? 'Reserva confirmada' : 'Reserva recusada',
          mensagem: aceita
            ? `Sua vaga em ${rota.origemNome} → ${rota.destinoNome} foi confirmada.`
            : `O motorista não pôde confirmar sua vaga em ${rota.origemNome} → ${rota.destinoNome}.`,
          referencia: solicitacao.caronaId,
        },
      }),
    ]);

    return atualizada;
  }

  /** Passageiro desiste da vaga; devolve a vaga à carona se já estava aceita. */
  async cancelar(passageiroId: string, id: string) {
    const solicitacao = await this.prisma.solicitacao.findUnique({
      where: { id },
      include: { carona: true },
    });

    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.');
    if (solicitacao.passageiroId !== passageiroId) {
      throw new ForbiddenException('Esta solicitação não é sua.');
    }
    if (solicitacao.status === StatusSolicitacao.CANCELADA) {
      return { message: 'Solicitação já estava cancelada.' };
    }

    const devolverVaga = solicitacao.status === StatusSolicitacao.ACEITA;
    const vagas = devolverVaga
      ? Math.min(
          solicitacao.carona.vagasDisponiveis + solicitacao.vagas,
          solicitacao.carona.vagasTotais,
        )
      : solicitacao.carona.vagasDisponiveis;

    await this.prisma.$transaction([
      this.prisma.solicitacao.update({
        where: { id },
        data: { status: StatusSolicitacao.CANCELADA },
      }),
      this.prisma.carona.update({
        where: { id: solicitacao.caronaId },
        data: {
          vagasDisponiveis: vagas,
          status:
            solicitacao.carona.status === StatusCarona.LOTADA && vagas > 0
              ? StatusCarona.ABERTA
              : solicitacao.carona.status,
        },
      }),
    ]);

    return { message: 'Reserva cancelada.' };
  }

  /** Solicitações que o usuário fez como passageiro. */
  minhas(passageiroId: string) {
    return this.prisma.solicitacao.findMany({
      where: { passageiroId },
      orderBy: { criadaEm: 'desc' },
      include: {
        carona: {
          select: {
            id: true,
            dataHoraPartida: true,
            precoPorPassageiro: true,
            status: true,
            rota: {
              select: {
                origemNome: true,
                destinoNome: true,
                usuario: { select: USUARIO_RESUMO },
              },
            },
          },
        },
      },
    });
  }

  /** Solicitações pendentes nas caronas que o usuário oferece. */
  recebidas(motoristaId: string) {
    return this.prisma.solicitacao.findMany({
      where: { carona: { rota: { usuarioId: motoristaId } }, status: StatusSolicitacao.PENDENTE },
      orderBy: { criadaEm: 'desc' },
      include: {
        passageiro: { select: USUARIO_RESUMO },
        carona: {
          select: {
            id: true,
            dataHoraPartida: true,
            rota: { select: { origemNome: true, destinoNome: true } },
          },
        },
      },
    });
  }
}
