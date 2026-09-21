import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { EnviarDocumentosDto } from './dto/enviar-documentos.dto';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /** Alimenta ProfileScreen e SettingsScreen. */
  @Get('me')
  meuPerfil(@CurrentUser('sub') id: string) {
    return this.usuarioService.perfilCompleto(id);
  }

  @Patch('me')
  atualizar(@CurrentUser('sub') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.atualizar(id, dto);
  }

  /** Alimenta HomeScreen, RideHistoryScreen e AnalyticsScreen. */
  @Get('me/estatisticas')
  estatisticas(@CurrentUser('sub') id: string) {
    return this.usuarioService.estatisticas(id);
  }

  @Get('me/verificacao')
  statusVerificacao(@CurrentUser('sub') id: string) {
    return this.usuarioService.statusVerificacao(id);
  }

  /** UC07 - IDVerificationScreen. */
  @Post('me/verificacao')
  enviarDocumentos(@CurrentUser('sub') id: string, @Body() dto: EnviarDocumentosDto) {
    return this.usuarioService.enviarDocumentos(id, dto);
  }

  @Get(':id')
  perfilPublico(@Param('id') id: string) {
    return this.usuarioService.perfilCompleto(id);
  }

  @Get(':id/avaliacoes')
  avaliacoes(@Param('id') id: string) {
    return this.usuarioService.avaliacoesRecebidas(id);
  }
}
