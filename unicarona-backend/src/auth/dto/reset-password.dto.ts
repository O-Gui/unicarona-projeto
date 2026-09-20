import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @IsString({ message: 'O código é obrigatório.' })
  @Matches(/^\d{6}$/, { message: 'O código deve ter 6 dígitos.' })
  codigo!: string;

  @IsString({ message: 'A nova senha é obrigatória.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  novaSenha!: string;
}