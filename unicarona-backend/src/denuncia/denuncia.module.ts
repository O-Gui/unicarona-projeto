import { Module } from '@nestjs/common';
import { DenunciaController } from './denuncia.controller';
import { DenunciaService } from './denuncia.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DenunciaController],
  providers: [DenunciaService],
})
export class DenunciaModule {}
