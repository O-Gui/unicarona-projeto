import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { NotificacaoService } from './notificacao.service';

@Controller('notificacoes')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  // =========================================================================
  // ROTAS PROTEGIDAS (Exigem Login / Token JWT)
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get()
  listar(
    @CurrentUser('sub') usuarioId: string,
    @Query('grupo') grupo?: string,
  ) {
    return this.notificacaoService.listar(usuarioId, grupo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('nao-lidas')
  naoLidas(@CurrentUser('sub') usuarioId: string) {
    return this.notificacaoService.contarMensagensNaoLidas(usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('ler-todas')
  lerTodas(@CurrentUser('sub') usuarioId: string) {
    return this.notificacaoService.marcarTodasComoLidas(usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/ler')
  ler(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.notificacaoService.marcarComoLida(usuarioId, id);
  }

  // =========================================================================
  // ROTAS UTILITÁRIAS DE TESTE (Acessíveis pelo Navegador)
  // =========================================================================

  // http://localhost:3000/notificacoes/disparar-anuncios
  @Get('disparar-anuncios')
  dispararAnuncios() {
    return this.notificacaoService.dispararAnunciosParaTodos();
  }

  // http://localhost:3000/notificacoes/limpar-anuncios
  @Get('limpar-anuncios')
  limparAnuncios() {
    return this.notificacaoService.limparAnuncios();
  }
}