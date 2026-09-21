import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AvaliacaoService } from './avaliacao.service';
import { CriarAvaliacaoDto } from './dto/criar-avaliacao.dto';

@UseGuards(JwtAuthGuard)
@Controller('avaliacoes')
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Post()
  criar(@CurrentUser('sub') usuarioId: string, @Body() dto: CriarAvaliacaoDto) {
    return this.avaliacaoService.criar(usuarioId, dto);
  }

  @Get('viagem/:viagemId/pendentes')
  pendentes(@CurrentUser('sub') usuarioId: string, @Param('viagemId') viagemId: string) {
    return this.avaliacaoService.pendentesDaViagem(usuarioId, viagemId);
  }

  @Get('resumo/:usuarioId')
  resumo(@Param('usuarioId') usuarioId: string) {
    return this.avaliacaoService.resumoDoUsuario(usuarioId);
  }
}
