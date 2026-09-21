import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export const MOTIVOS_DENUNCIA = [
  'seguranca',
  'assedio',
  'fraude',
  'falta',
  'veiculo',
  'rota',
  'pagamento',
  'outro',
] as const;

export class CriarDenunciaDto {
  @IsIn(MOTIVOS_DENUNCIA as unknown as string[])
  motivo!: string;

  @IsString() @MinLength(10) @MaxLength(1000)
  descricao!: string;

  /** Pessoa denunciada, quando a denúncia é sobre alguém. */
  @IsOptional() @IsUUID()
  alvoId?: string;

  /** Carona relacionada, quando a denúncia parte de uma viagem. */
  @IsOptional() @IsUUID()
  caronaId?: string;

  @IsOptional() @IsBoolean()
  anonima?: boolean;
}
