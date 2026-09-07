import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'node:crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  perfil: string;
  iat: number;
  exp: number;
}

@Injectable()
export class TokenService {
  private readonly secret = process.env.JWT_SECRET || 'change-me-in-production';
  private readonly ttlSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS || 86400);

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const header = this.base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const body = this.base64Url(JSON.stringify({ ...payload, iat: now, exp: now + this.ttlSeconds }));
    const data = `${header}.${body}`;
    const signature = createHmac('sha256', this.secret).update(data).digest('base64url');
    return `${data}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) throw new UnauthorizedException('Token inválido.');

    const expected = createHmac('sha256', this.secret).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) throw new UnauthorizedException('Token inválido.');

    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Token inválido.');
    }

    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expirado.');
    }

    return payload;
  }

  private base64Url(value: string) {
    return Buffer.from(value).toString('base64url');
  }
}
