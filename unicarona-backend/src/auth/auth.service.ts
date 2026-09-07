import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarioService: UsuarioService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
  ) { }

  async register(dto: RegisterDto) {
    const nome = this.requiredText(dto.nome, 'Nome');
    const email = this.normalizeEmail(dto.email);
    const cpf = this.normalizeCpf(dto.cpf);
    const senha = dto.senha;

    this.validateEmail(email);
    this.validateCpf(cpf);
    this.validatePassword(senha);

    const [emailExists, cpfExists] = await Promise.all([
      this.usuarioService.findByEmail(email),
      this.usuarioService.findByCpf(cpf),
    ]);

    if (emailExists) throw new ConflictException('E-mail já cadastrado.');
    if (cpfExists) throw new ConflictException('CPF já cadastrado.');

    const senhaHash = await this.passwordService.hash(senha);
    const usuario = await this.prisma.usuario.create({
      data: {
        nome,
        email,
        cpf,
        senhaHash,
        perfil: 'PASSAGEIRO',
      },
    });

    await this.emailVerificationService.createAndSend(usuario.id, usuario.email);

    return {
      message: 'Cadastro realizado. Enviamos um código para seu e-mail institucional.',
      usuario: this.publicUser(usuario),
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {

    const email = this.normalizeEmail(dto.email);
    const codigo = String(dto.codigo ?? '').trim();

    console.log('EMAIL RECEBIDO:', dto.email);
    console.log('EMAIL NORMALIZADO:', email);

    const usuario = await this.usuarioService.findByEmail(email);

    console.log('USUARIO ENCONTRADO:', usuario);

    if (!usuario) throw new BadRequestException('Usuário não encontrado.');

    if (!usuario) throw new BadRequestException('Usuário não encontrado.');
    if (usuario.emailValidado) return { message: 'E-mail já validado.' };
    if (!/^\d{6}$/.test(codigo)) throw new BadRequestException('O código deve ter 6 dígitos.');

    const valid = await this.emailVerificationService.verify(usuario.id, codigo);
    if (!valid) throw new BadRequestException('Código inválido ou expirado.');

    const atualizado = await this.usuarioService.findById(usuario.id);
    if (!atualizado) throw new BadRequestException('Usuário não encontrado.');

    return { message: 'E-mail validado com sucesso.', usuario: this.publicUser(atualizado) };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const email = this.normalizeEmail(dto.email);
    const usuario = await this.usuarioService.findByEmail(email);
    if (!usuario) throw new BadRequestException('Usuário não encontrado.');
    if (usuario.emailValidado) throw new BadRequestException('Este e-mail já foi validado.');

    await this.emailVerificationService.createAndSend(usuario.id, usuario.email);
    return { message: 'Novo código de verificação enviado.' };
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const senha = String(dto.senha ?? '');
    const usuario = await this.usuarioService.findByEmail(email);

    if (!usuario || !(await this.passwordService.compare(senha, usuario.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    if (!usuario.emailValidado) {
      throw new UnauthorizedException('Valide seu e-mail institucional antes de entrar.');
    }

    const accessToken = this.tokenService.sign({
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });

    return { accessToken, tokenType: 'Bearer', usuario: this.publicUser(usuario) };
  }

  async me(userId: string) {
    const usuario = await this.usuarioService.findById(userId);
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado.');
    return this.publicUser(usuario);
  }

  private publicUser(usuario: { id: string; nome: string; email: string; cpf: string; perfil: string; emailValidado: boolean }) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      perfil: usuario.perfil,
      emailValidado: usuario.emailValidado,
    };
  }

  private normalizeEmail(email: string) {
    return String(email ?? '').trim().toLowerCase();
  }

  private normalizeCpf(cpf: string) {
    return String(cpf ?? '').replace(/\D/g, '');
  }

  private requiredText(value: string, field: string) {
    const result = String(value ?? '').trim();
    if (!result) throw new BadRequestException(`${field} é obrigatório.`);
    if (result.length < 2) throw new BadRequestException(`${field} inválido.`);
    return result;
  }

  private validateEmail(email: string) {
    if (!/^[^\s@]+@a\.ucb\.br$/i.test(email)) {
      throw new BadRequestException('Use um e-mail institucional @a.ucb.br.');
    }
  }

  private validateCpf(cpf: string) {
    if (!/^\d{11}$/.test(cpf) || /^([0-9])\1{10}$/.test(cpf) || !this.validCpfDigits(cpf)) {
      throw new BadRequestException('CPF inválido.');
    }
  }

  private validCpfDigits(cpf: string) {
    const calc = (length: number) => {
      let sum = 0;
      for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i);
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };
    return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
  }

  private validatePassword(password: string) {
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      throw new BadRequestException('A senha deve ter entre 8 e 72 caracteres.');
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra e um número.');
    }
  }
}
