import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findByCpf(cpf: string) {
    return this.prisma.usuario.findUnique({ where: { cpf } });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }
}
