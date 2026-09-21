import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { CaronaService } from './carona.service';
import { CriarCaronaDto } from './dto/criar-carona.dto';
import { BuscarCaronaDto } from './dto/buscar-carona.dto';
import { LOCAIS } from '../common/locais';

@UseGuards(JwtAuthGuard)
@Controller('caronas')
export class CaronaController {
  constructor(private readonly caronaService: CaronaService) {}

  /** Alimenta o autocomplete das telas de busca e do mapa do campus. */
  @Get('locais')
  locais() {
    return LOCAIS.map(({ nome, lat, lng, endereco }) => ({ nome, lat, lng, endereco }));
  }

  @Get()
  buscar(@CurrentUser('sub') usuarioId: string, @Query() filtros: BuscarCaronaDto) {
    return this.caronaService.buscar(usuarioId, filtros);
  }

  @Get('minhas')
  minhas(@CurrentUser('sub') usuarioId: string) {
    return this.caronaService.minhasCaronas(usuarioId);
  }

  @Get('historico')
  historico(@CurrentUser('sub') usuarioId: string) {
    return this.caronaService.historico(usuarioId);
  }

  @Get(':id')
  detalhe(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.caronaService.detalhe(usuarioId, id);
  }

  @Post()
  criar(@CurrentUser('sub') usuarioId: string, @Body() dto: CriarCaronaDto) {
    return this.caronaService.criar(usuarioId, dto);
  }

  @Patch(':id/cancelar')
  cancelar(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.caronaService.cancelar(usuarioId, id);
  }

  @Patch(':id/concluir')
  concluir(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.caronaService.concluir(usuarioId, id);
  }
}
