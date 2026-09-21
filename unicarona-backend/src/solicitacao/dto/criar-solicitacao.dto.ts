import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CriarSolicitacaoDto {
  @IsUUID()
  caronaId!: string;

  @IsOptional() @IsInt() @Min(1) @Max(8) @Type(() => Number)
  vagas?: number;

  @IsOptional() @IsString() @MaxLength(300)
  mensagem?: string;
}
