import { Global, Module } from '@nestjs/common';
import { TokenService } from '../auth/services/token.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Emissão e validação de token ficam num módulo próprio para que qualquer
 * feature possa proteger rotas com JwtAuthGuard sem importar o AuthModule
 * (que já depende de UsuarioModule — importá-lo de volta criaria ciclo).
 */
@Global()
@Module({
  providers: [TokenService, JwtAuthGuard],
  exports: [TokenService, JwtAuthGuard],
})
export class SecurityModule {}
