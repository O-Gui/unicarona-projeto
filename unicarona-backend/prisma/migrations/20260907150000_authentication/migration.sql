CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE "PerfilUsuario" AS ENUM ('PASSAGEIRO', 'MOTORISTA', 'AMBOS');

ALTER TABLE "Usuario" ADD COLUMN "cpf" VARCHAR(11);
ALTER TABLE "Usuario" ADD COLUMN "perfil" "PerfilUsuario" NOT NULL DEFAULT 'PASSAGEIRO';

CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

CREATE TABLE "CodigoVerificacaoEmail" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "usuarioId" UUID NOT NULL,
  "codigoHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usado" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CodigoVerificacaoEmail_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CodigoVerificacaoEmail_usuarioId_usado_idx" ON "CodigoVerificacaoEmail"("usuarioId", "usado");
ALTER TABLE "CodigoVerificacaoEmail" ADD CONSTRAINT "CodigoVerificacaoEmail_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
