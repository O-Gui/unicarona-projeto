import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarAvaliacaoDto {
  @IsUUID()
  viagemId!: string;

  /** Quem está sendo avaliado (motorista ou outro passageiro). */
  @IsUUID()
  alvoId!: string;

  @IsInt() @Min(1) @Max(5) @Type(() => Number)
  nota!: number;

  @IsOptional() @IsString() @MaxLength(500)
  comentario?: string;

  /** { pontualidade: 5, seguranca: 4, limpeza: 5, comunicacao: 5 } */
  @IsOptional() @IsObject()
  categorias?: Record<string, number>;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}
