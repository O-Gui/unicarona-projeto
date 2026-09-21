import { Module } from '@nestjs/common';
import { VeiculoController } from './veiculo.controller';
import { VeiculoService } from './veiculo.service';
import { PrismaModule } from '../prisma/prisma.module'; // Ajuste o caminho se necessário para o seu PrismaModule

@Module({
  imports: [PrismaModule],
  controllers: [VeiculoController],
  providers: [VeiculoService],
})
export class VeiculoModule {}