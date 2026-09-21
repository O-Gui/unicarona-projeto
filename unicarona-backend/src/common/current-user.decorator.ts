import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/services/token.service';

/**
 * Injeta o payload do JWT já validado pelo JwtAuthGuard.
 * Uso: metodo(@CurrentUser() user: JwtPayload) ou @CurrentUser('sub') id: string
 */
export const CurrentUser = createParamDecorator(
  (campo: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return campo ? request.user?.[campo] : request.user;
  },
);
