import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PerfilUsuario } from '@prisma/client';

export class UpdateUsuarioDto {
  @IsOptional() @IsString() @MaxLength(120)
  nome?: string;

  @IsOptional() @IsString() @MaxLength(120)
  curso?: string;

  @IsOptional() @IsString() @MaxLength(160)
  universidade?: string;

  @IsOptional() @IsString() @MaxLength(20)
  telefone?: string;

  @IsOptional() @IsString() @MaxLength(400)
  bio?: string;

  @IsOptional() @IsString()
  fotoUrl?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  preferencias?: string[];

  @IsOptional() @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;
}
