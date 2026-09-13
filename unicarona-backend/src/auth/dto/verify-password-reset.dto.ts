import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class VerifyPasswordResetDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @IsString({ message: 'O código é obrigatório.' })
  @Length(6, 6, { message: 'O código deve ter 6 dígitos.' })
  @Matches(/^\d{6}$/, { message: 'O código deve ter 6 dígitos.' })
  codigo!: string;
}