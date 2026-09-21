import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { NotificacaoService } from './notificacao.service';

@UseGuards(JwtAuthGuard)
@Controller('notificacoes')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Get()
  listar(@CurrentUser('sub') usuarioId: string, @Query('grupo') grupo?: string) {
    return this.notificacaoService.listar(usuarioId, grupo);
  }

  @Get('nao-lidas')
  naoLidas(@CurrentUser('sub') usuarioId: string) {
    return this.notificacaoService.contarNaoLidas(usuarioId);
  }

  @Patch('ler-todas')
  lerTodas(@CurrentUser('sub') usuarioId: string) {
    return this.notificacaoService.marcarTodasComoLidas(usuarioId);
  }

  @Patch(':id/ler')
  ler(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.notificacaoService.marcarComoLida(usuarioId, id);
  }
}
