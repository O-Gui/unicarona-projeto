import { Module } from '@nestjs/common';
import { UsuarioModule } from '../usuario/usuario.module';
import { SecurityModule } from '../common/security.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordService } from './services/password.service';

@Module({
  imports: [UsuarioModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, EmailVerificationService],
})
export class AuthModule {}
