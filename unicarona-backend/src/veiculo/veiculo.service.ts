import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VeiculoService {
  constructor(private prisma: PrismaService) {}

  async salvarVeiculo(usuarioId: string, data: { modelo: string; placa: string; capacidade: number }) {
    // Procura se já existe um veículo para este utilizador, se existir atualiza, senão cria
    return await this.prisma.veiculo.upsert({
      where: { placa: data.placa },
      update: {
        modelo: data.modelo,
        capacidadeVagas: data.capacidade,
        usuarioId,
      },
      create: {
        usuarioId,
        modelo: data.modelo,
        placa: data.placa,
        capacidadeVagas: data.capacidade,
      },
    });
  }
}