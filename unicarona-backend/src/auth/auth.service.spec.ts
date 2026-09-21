import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from '@jest/globals';
import { AuthService } from './auth.service';

function makeService() {
  return new AuthService({} as any, {} as any, {} as any, {} as any, {} as any);
}

describe('AuthService', () => {
  it('rejects non-institutional email during registration', async () => {
    const service = makeService();
    await expect(service.register({
      nome: 'Maria', email: 'maria@gmail.com', cpf: '52998224725', senha: 'Senha123',
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects weak passwords during registration', async () => {
    const service = makeService();
    await expect(service.register({
      nome: 'Maria', email: 'maria@a.ucb.br', cpf: '52998224725', senha: '12345678', 
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});
