import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { SolicitacaoService } from './solicitacao.service';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';
import { ResponderSolicitacaoDto } from './dto/responder-solicitacao.dto';

@UseGuards(JwtAuthGuard)
@Controller('solicitacoes')
export class SolicitacaoController {
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Get('minhas')
  minhas(@CurrentUser('sub') usuarioId: string) {
    return this.solicitacaoService.minhas(usuarioId);
  }

  @Get('recebidas')
  recebidas(@CurrentUser('sub') usuarioId: string) {
    return this.solicitacaoService.recebidas(usuarioId);
  }

  @Post()
  criar(@CurrentUser('sub') usuarioId: string, @Body() dto: CriarSolicitacaoDto) {
    return this.solicitacaoService.criar(usuarioId, dto);
  }

  @Patch(':id/responder')
  responder(
    @CurrentUser('sub') usuarioId: string,
    @Param('id') id: string,
    @Body() dto: ResponderSolicitacaoDto,
  ) {
    return this.solicitacaoService.responder(usuarioId, id, dto);
  }

  @Patch(':id/cancelar')
  cancelar(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.solicitacaoService.cancelar(usuarioId, id);
  }
}
