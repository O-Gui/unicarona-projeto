import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { VeiculoService } from './veiculo.service';
import { SalvarVeiculoDto } from './dto/salvar-veiculo.dto';

@UseGuards(JwtAuthGuard)
@Controller('veiculos')
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Get()
  listar(@CurrentUser('sub') usuarioId: string) {
    return this.veiculoService.listarDoUsuario(usuarioId);
  }

  @Get('me')
  principal(@CurrentUser('sub') usuarioId: string) {
    return this.veiculoService.veiculoPrincipal(usuarioId);
  }

  /**
   * O usuário vem do token: o app não envia mais usuarioId no corpo, o que
   * impedia qualquer um de cadastrar veículo em nome de outra pessoa.
   */
  @Post()
  salvar(@CurrentUser('sub') usuarioId: string, @Body() dto: SalvarVeiculoDto) {
    return this.veiculoService.salvarVeiculo(usuarioId, dto);
  }

  @Delete(':id')
  remover(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.veiculoService.remover(usuarioId, id);
  }
}
