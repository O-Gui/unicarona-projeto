import { IsIn } from 'class-validator';

export class ResponderSolicitacaoDto {
  @IsIn(['ACEITA', 'RECUSADA'])
  status!: 'ACEITA' | 'RECUSADA';
}
