import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  cpf!: string;

  @IsString()
  @IsNotEmpty()
  senha!: string;

  /** Coletado na RegistrationScreen e exibido no perfil. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  curso?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  universidade?: string;
}
