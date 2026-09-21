import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { DenunciaService } from './denuncia.service';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';

@UseGuards(JwtAuthGuard)
@Controller('denuncias')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Get('minhas')
  minhas(@CurrentUser('sub') usuarioId: string) {
    return this.denunciaService.minhas(usuarioId);
  }

  @Post()
  criar(@CurrentUser('sub') usuarioId: string, @Body() dto: CriarDenunciaDto) {
    return this.denunciaService.criar(usuarioId, dto);
  }
}
