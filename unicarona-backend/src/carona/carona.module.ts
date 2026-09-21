import { Module } from '@nestjs/common';
import { CaronaController } from './carona.controller';
import { CaronaService } from './carona.service';
import { RotaRepository } from './rota.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CaronaController],
  providers: [CaronaService, RotaRepository],
  exports: [CaronaService, RotaRepository],
})
export class CaronaModule {}
