import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarCaronaDto {
  @IsString() @MaxLength(120)
  origemNome!: string;

  @IsOptional() @IsString() @MaxLength(200)
  origemEndereco?: string;

  @IsOptional() @IsLatitude()
  origemLat?: number;

  @IsOptional() @IsLongitude()
  origemLng?: number;

  @IsString() @MaxLength(120)
  destinoNome!: string;

  @IsOptional() @IsString() @MaxLength(200)
  destinoEndereco?: string;

  @IsOptional() @IsLatitude()
  destinoLat?: number;

  @IsOptional() @IsLongitude()
  destinoLng?: number;

  /** ISO 8601, ex.: 2026-05-01T08:30:00.000Z */
  @IsDateString()
  dataHoraPartida!: string;

  @IsInt() @Min(1) @Max(8) @Type(() => Number)
  vagas!: number;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(500) @Type(() => Number)
  precoPorPassageiro!: number;

  @IsOptional() @IsUUID()
  veiculoId?: string;

  @IsOptional() @IsString() @MaxLength(500)
  observacoes?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  preferencias?: string[];
}
