import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';

/**
 * UC — Reportar problema. A moderação em si acontece fora do app; aqui a
 * denúncia é registrada e fica disponível para quem a enviou acompanhar.
 */
@Injectable()
export class DenunciaService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(autorId: string, dto: CriarDenunciaDto) {
    if (dto.alvoId === autorId) {
      throw new BadRequestException('Você não pode denunciar a si mesmo.');
    }

    if (dto.alvoId) {
      const alvo = await this.prisma.usuario.findUnique({ where: { id: dto.alvoId } });
      if (!alvo) throw new NotFoundException('Pessoa denunciada não encontrada.');
    }

    if (dto.caronaId) {
      const carona = await this.prisma.carona.findUnique({ where: { id: dto.caronaId } });
      if (!carona) throw new NotFoundException('Carona não encontrada.');
    }

    const denuncia = await this.prisma.denuncia.create({
      data: {
        autorId,
        alvoId: dto.alvoId ?? null,
        caronaId: dto.caronaId ?? null,
        motivo: dto.motivo,
        descricao: dto.descricao,
        anonima: dto.anonima ?? false,
      },
    });

    return {
      id: denuncia.id,
      status: denuncia.status,
      message: 'Denúncia registrada. Nossa equipe analisa em até 24 horas.',
    };
  }

  async minhas(autorId: string) {
    const denuncias = await this.prisma.denuncia.findMany({
      where: { autorId },
      orderBy: { criadaEm: 'desc' },
      include: { alvo: { select: { id: true, nome: true } } },
    });

    return denuncias.map((denuncia) => ({
      id: denuncia.id,
      motivo: denuncia.motivo,
      descricao: denuncia.descricao,
      status: denuncia.status,
      criadaEm: denuncia.criadaEm,
      alvo: denuncia.alvo,
    }));
  }
}
