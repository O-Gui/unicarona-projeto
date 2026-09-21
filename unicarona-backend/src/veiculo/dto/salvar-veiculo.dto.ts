import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class SalvarVeiculoDto {
  @IsString() @MaxLength(80)
  modelo!: string;

  /** Aceita placa antiga (ABC1234) e Mercosul (ABC1D23). */
  @IsString()
  @Matches(/^[A-Za-z]{3}[0-9][0-9A-Za-z][0-9]{2}$/, {
    message: 'Informe uma placa válida (ex.: ABC1D23).',
  })
  placa!: string;

  @IsInt() @Min(1) @Max(8)
  capacidade!: number;

  @IsOptional() @IsString() @MaxLength(30)
  cor?: string;

  @IsOptional() @IsInt() @Min(1950) @Max(2100)
  ano?: number;
}
