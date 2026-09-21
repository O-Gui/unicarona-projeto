import { Controller, Post, Body } from '@nestjs/common';
import { VeiculoService } from './veiculo.service';

@Controller('veiculos')
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  async criarOuAtualizar(@Body() body: { usuarioId: string; modelo: string; placa: string; capacidade: number }) {
    return this.veiculoService.salvarVeiculo(body.usuarioId, {
      modelo: body.modelo,
      placa: body.placa,
      capacidade: body.capacidade,
    });
  }
}