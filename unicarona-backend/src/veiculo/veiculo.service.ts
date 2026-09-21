import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PerfilUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SalvarVeiculoDto } from './dto/salvar-veiculo.dto';

@Injectable()
export class VeiculoService {
  constructor(private readonly prisma: PrismaService) {}

  listarDoUsuario(usuarioId: string) {
    return this.prisma.veiculo.findMany({ where: { usuarioId } });
  }

  /** CarScreen usa um veículo por usuário; devolvemos o primeiro cadastrado. */
  async veiculoPrincipal(usuarioId: string) {
    return this.prisma.veiculo.findFirst({ where: { usuarioId } });
  }

  /**
   * Cria ou atualiza o veículo pela placa. Quem cadastra um veículo passa a
   * poder oferecer caronas, então o perfil sobe de PASSAGEIRO para AMBOS.
   */
  async salvarVeiculo(usuarioId: string, dto: SalvarVeiculoDto) {
    const placa = dto.placa.toUpperCase();

    const existente = await this.prisma.veiculo.findUnique({ where: { placa } });
    if (existente && existente.usuarioId !== usuarioId) {
      throw new ConflictException('Esta placa já está cadastrada por outro usuário.');
    }

    const veiculo = await this.prisma.veiculo.upsert({
      where: { placa },
      update: {
        modelo: dto.modelo,
        capacidadeVagas: dto.capacidade,
        cor: dto.cor,
        ano: dto.ano,
        usuarioId,
      },
      create: {
        usuarioId,
        modelo: dto.modelo,
        placa,
        capacidadeVagas: dto.capacidade,
        cor: dto.cor,
        ano: dto.ano,
      },
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { perfil: true },
    });

    if (usuario?.perfil === PerfilUsuario.PASSAGEIRO) {
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { perfil: PerfilUsuario.AMBOS },
      });
    }

    return veiculo;
  }

  async remover(usuarioId: string, id: string) {
    const veiculo = await this.prisma.veiculo.findUnique({ where: { id } });
    if (!veiculo || veiculo.usuarioId !== usuarioId) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    await this.prisma.veiculo.delete({ where: { id } });
    return { message: 'Veículo removido.' };
  }
}
