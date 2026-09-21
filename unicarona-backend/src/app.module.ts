import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SecurityModule } from './common/security.module';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { VeiculoModule } from './veiculo/veiculo.module';
import { CaronaModule } from './carona/carona.module';
import { SolicitacaoModule } from './solicitacao/solicitacao.module';
import { AvaliacaoModule } from './avaliacao/avaliacao.module';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { ChatModule } from './chat/chat.module';
import { DenunciaModule } from './denuncia/denuncia.module';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    AuthModule,
    UsuarioModule,
    VeiculoModule,
    CaronaModule,
    SolicitacaoModule,
    AvaliacaoModule,
    NotificacaoModule,
    ChatModule,
    DenunciaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
