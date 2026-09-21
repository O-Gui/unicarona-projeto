import { Type } from 'class-transformer';
import {
  IsArray,
  IsBooleanString,
  IsDateString,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * Query da FindRideScreen e da AdvancedSearchScreen. Todos os campos são
 * opcionais: a busca simples manda só origem/destino, a avançada acrescenta
 * faixa de preço, janela de horário e preferências.
 */
export class BuscarCaronaDto {
  @IsOptional() @IsString()
  origem?: string;

  @IsOptional() @IsLatitude() @Type(() => Number)
  origemLat?: number;

  @IsOptional() @IsLongitude() @Type(() => Number)
  origemLng?: number;

  @IsOptional() @IsString()
  destino?: string;

  @IsOptional() @IsLatitude() @Type(() => Number)
  destinoLat?: number;

  @IsOptional() @IsLongitude() @Type(() => Number)
  destinoLng?: number;

  /** Data (YYYY-MM-DD) ou ISO completo; filtra o dia inteiro. */
  @IsOptional() @IsDateString()
  data?: string;

  @IsOptional() @IsString()
  horaInicio?: string;

  @IsOptional() @IsString()
  horaFim?: string;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  precoMin?: number;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  precoMax?: number;

  @IsOptional() @IsInt() @Min(1) @Type(() => Number)
  vagasMinimas?: number;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  notaMinima?: number;

  /** Raio de proximidade em metros (padrão 3000). */
  @IsOptional() @IsInt() @Min(100) @Type(() => Number)
  raioMetros?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  preferencias?: string[];

  @IsOptional() @IsBooleanString()
  apenasVerificados?: string;
}
