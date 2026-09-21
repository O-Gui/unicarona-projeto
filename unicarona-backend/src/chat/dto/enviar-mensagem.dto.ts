import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EnviarMensagemDto {
  /**
   * Conversa existente.
   * Se ausente, informe destinatarioId e caronaId.
   */
  @IsOptional()
  @IsUUID()
  conversaId?: string;

  /**
   * Usuário com quem a conversa será iniciada.
   * Obrigatório quando conversaId não for informado.
   */
  @IsOptional()
  @IsUUID()
  destinatarioId?: string;

  /**
   * Carona à qual a conversa estará vinculada.
   * Obrigatório quando uma nova conversa for criada.
   */
  @IsOptional()
  @IsUUID()
  caronaId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  texto!: string;
}