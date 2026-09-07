import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly expirationMinutes = Number(process.env.EMAIL_CODE_EXPIRATION_MINUTES || 10);

  constructor(private readonly prisma: PrismaService) {}

  async createAndSend(userId: string, email: string): Promise<void> {
    const codigo = randomInt(100000, 1000000).toString();
    const codigoHash = createHash('sha256').update(codigo).digest('hex');
    const expiresAt = new Date(Date.now() + this.expirationMinutes * 60 * 1000);

    await this.prisma.codigoVerificacaoEmail.updateMany({
      where: { usuarioId: userId, usado: false },
      data: { usado: true },
    });

    await this.prisma.codigoVerificacaoEmail.create({
      data: { usuarioId: userId, codigoHash, expiresAt },
    });

    // Desenvolvimento: até o SMTP ser configurado, o código aparece no terminal.
    // Em produção, substituir por um provider de e-mail.
    this.logger.log(`[DEV] Código de verificação para ${email}: ${codigo}`);
  }

  async verify(userId: string, codigo: string): Promise<boolean> {
    const codigoHash = createHash('sha256').update(codigo).digest('hex');
    const record = await this.prisma.codigoVerificacaoEmail.findFirst({
      where: { usuarioId: userId, codigoHash, usado: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) return false;

    await this.prisma.$transaction([
      this.prisma.codigoVerificacaoEmail.update({ where: { id: record.id }, data: { usado: true } }),
      this.prisma.usuario.update({ where: { id: userId }, data: { emailValidado: true } }),
    ]);

    return true;
  }
}
