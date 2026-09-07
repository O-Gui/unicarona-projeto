import { Module } from '@nestjs/common';
import { UsuarioModule } from '../usuario/usuario.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [UsuarioModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, EmailVerificationService, JwtAuthGuard],
  exports: [TokenService, JwtAuthGuard],
})
export class AuthModule {}
