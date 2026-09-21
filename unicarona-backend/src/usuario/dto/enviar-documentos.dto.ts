import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export const TIPOS_DOCUMENTO = ['CARTEIRA_FRENTE', 'CARTEIRA_VERSO', 'CNH', 'SELFIE'] as const;

export class DocumentoDto {
  @IsIn(TIPOS_DOCUMENTO as unknown as string[])
  tipo!: string;

  /** URL ou data-uri do arquivo enviado pelo app. */
  @IsString()
  arquivoUrl!: string;
}

export class EnviarDocumentosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentoDto)
  documentos!: DocumentoDto[];
}
