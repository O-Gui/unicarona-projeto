/*
  Warnings:

  - The `status` column on the `Solicitacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[viagemId,autorId,alvoId]` on the table `Avaliacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[viagemId,usuarioId]` on the table `Participacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passageiroId,caronaId]` on the table `Solicitacao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alvoId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autorId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinoNome` to the `Rota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origemNome` to the `Rota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo` to the `Veiculo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusVerificacao" AS ENUM ('NAO_ENVIADA', 'PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "StatusCarona" AS ENUM ('ABERTA', 'LOTADA', 'CANCELADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('SOLICITACAO_CARONA', 'SOLICITACAO_RESPONDIDA', 'CARONA_CANCELADA', 'LEMBRETE_CARONA', 'NOVA_AVALIACAO', 'VERIFICACAO', 'MENSAGEM');

-- CreateEnum
CREATE TYPE "StatusDenuncia" AS ENUM ('ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'ARQUIVADA');

-- AlterTable
ALTER TABLE "Avaliacao" ADD COLUMN     "alvoId" UUID NOT NULL,
ADD COLUMN     "autorId" UUID NOT NULL,
ADD COLUMN     "categorias" JSONB,
ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Carona" ADD COLUMN     "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "precoPorPassageiro" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "preferencias" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" "StatusCarona" NOT NULL DEFAULT 'ABERTA',
ADD COLUMN     "vagasDisponiveis" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "vagasTotais" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "veiculoId" UUID;

-- AlterTable
ALTER TABLE "Participacao" ADD COLUMN     "papel" TEXT NOT NULL DEFAULT 'PASSAGEIRO',
ADD COLUMN     "valorPago" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Rota" ADD COLUMN     "destinoEndereco" TEXT,
ADD COLUMN     "destinoNome" TEXT NOT NULL,
ADD COLUMN     "origemEndereco" TEXT,
ADD COLUMN     "origemNome" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mensagem" TEXT,
ADD COLUMN     "vagas" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "curso" TEXT,
ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "preferencias" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "statusVerificacao" "StatusVerificacao" NOT NULL DEFAULT 'NAO_ENVIADA',
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "universidade" TEXT;

-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN     "ano" INTEGER,
ADD COLUMN     "cor" TEXT,
ADD COLUMN     "modelo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Viagem" ADD COLUMN     "concluidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DocumentoVerificacao" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoVerificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "referencia" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" UUID NOT NULL,
    "usuarioAId" UUID NOT NULL,
    "usuarioBId" UUID NOT NULL,
    "caronaId" UUID NOT NULL,
    "atualizadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" UUID NOT NULL,
    "conversaId" UUID NOT NULL,
    "autorId" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "enviadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Denuncia" (
    "id" UUID NOT NULL,
    "autorId" UUID NOT NULL,
    "alvoId" UUID,
    "caronaId" UUID,
    "motivo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "anonima" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusDenuncia" NOT NULL DEFAULT 'ABERTA',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoVerificacao_usuarioId_tipo_key" ON "DocumentoVerificacao"("usuarioId", "tipo");

-- CreateIndex
CREATE INDEX "Notificacao_usuarioId_lida_criadaEm_idx" ON "Notificacao"("usuarioId", "lida", "criadaEm");

-- CreateIndex
CREATE UNIQUE INDEX "Conversa_usuarioAId_usuarioBId_caronaId_key" ON "Conversa"("usuarioAId", "usuarioBId", "caronaId");

-- CreateIndex
CREATE INDEX "Mensagem_conversaId_enviadaEm_idx" ON "Mensagem"("conversaId", "enviadaEm");

-- CreateIndex
CREATE INDEX "Denuncia_autorId_idx" ON "Denuncia"("autorId");

-- CreateIndex
CREATE INDEX "Denuncia_status_idx" ON "Denuncia"("status");

-- CreateIndex
CREATE INDEX "Avaliacao_alvoId_idx" ON "Avaliacao"("alvoId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_viagemId_autorId_alvoId_key" ON "Avaliacao"("viagemId", "autorId", "alvoId");

-- CreateIndex
CREATE INDEX "Carona_dataHoraPartida_status_idx" ON "Carona"("dataHoraPartida", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Participacao_viagemId_usuarioId_key" ON "Participacao"("viagemId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitacao_passageiroId_caronaId_key" ON "Solicitacao"("passageiroId", "caronaId");

-- AddForeignKey
ALTER TABLE "DocumentoVerificacao" ADD CONSTRAINT "DocumentoVerificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carona" ADD CONSTRAINT "Carona_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_usuarioAId_fkey" FOREIGN KEY ("usuarioAId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_usuarioBId_fkey" FOREIGN KEY ("usuarioBId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_caronaId_fkey" FOREIGN KEY ("caronaId") REFERENCES "Carona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "Conversa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_alvoId_fkey" FOREIGN KEY ("alvoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_alvoId_fkey" FOREIGN KEY ("alvoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_caronaId_fkey" FOREIGN KEY ("caronaId") REFERENCES "Carona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
