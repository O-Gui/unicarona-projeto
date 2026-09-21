import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { ChatService } from './chat.service';
import { EnviarMensagemDto } from './dto/enviar-mensagem.dto';

@UseGuards(JwtAuthGuard)
@Controller('conversas')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get()
  conversas(@CurrentUser('sub') usuarioId: string) {
    return this.chatService.conversas(usuarioId);
  }

  @Get(':id/mensagens')
  mensagens(@CurrentUser('sub') usuarioId: string, @Param('id') id: string) {
    return this.chatService.mensagens(usuarioId, id);
  }

  /** Usado pelo botão "Mensagem" do detalhe da carona. */
  @Post('abrir')
  abrir(
    @CurrentUser('sub') usuarioId: string,
    @Body() body: { destinatarioId: string; caronaId: string },
  ) {
    return this.chatService
      .abrirConversa(usuarioId, body.destinatarioId, body.caronaId)
      .then((id) => ({ conversaId: id }));
  }

  @Post('mensagens')
  enviar(@CurrentUser('sub') usuarioId: string, @Body() dto: EnviarMensagemDto) {
    return this.chatService.enviar(usuarioId, dto);
  }
}
