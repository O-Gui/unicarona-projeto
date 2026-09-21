import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface CriarRotaInput {
  usuarioId: string;
  origemNome: string;
  origemEndereco?: string;
  origemLat: number;
  origemLng: number;
  destinoNome: string;
  destinoEndereco?: string;
  destinoLat: number;
  destinoLng: number;
}

export interface RotaComCoordenadas {
  id: string;
  usuarioId: string;
  origemNome: string;
  origemEndereco: string | null;
  destinoNome: string;
  destinoEndereco: string | null;
  origemLat: number;
  origemLng: number;
  destinoLat: number;
  destinoLng: number;
}

/**
 * Rota guarda dois campos geography(Point, 4326), que o Prisma marca como
 * Unsupported e por isso não consegue escrever nem ler pelo client tipado.
 * Todo acesso a esses campos passa por aqui, em SQL cru.
 */
@Injectable()
export class RotaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(input: CriarRotaInput): Promise<string> {
    const id = randomUUID();

    await this.prisma.$executeRaw`
      INSERT INTO "Rota" (
        "id", "usuarioId",
        "pontoOrigem", "pontoDestino",
        "origemNome", "origemEndereco", "destinoNome", "destinoEndereco"
      ) VALUES (
        ${id}::uuid, ${input.usuarioId}::uuid,
        ST_SetSRID(ST_MakePoint(${input.origemLng}, ${input.origemLat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${input.destinoLng}, ${input.destinoLat}), 4326)::geography,
        ${input.origemNome}, ${input.origemEndereco ?? null},
        ${input.destinoNome}, ${input.destinoEndereco ?? null}
      )
    `;

    return id;
  }

  async buscarPorId(id: string): Promise<RotaComCoordenadas | null> {
    const linhas = await this.prisma.$queryRaw<RotaComCoordenadas[]>`
      SELECT
        "id", "usuarioId", "origemNome", "origemEndereco", "destinoNome", "destinoEndereco",
        ST_Y("pontoOrigem"::geometry)  AS "origemLat",
        ST_X("pontoOrigem"::geometry)  AS "origemLng",
        ST_Y("pontoDestino"::geometry) AS "destinoLat",
        ST_X("pontoDestino"::geometry) AS "destinoLng"
      FROM "Rota"
      WHERE "id" = ${id}::uuid
    `;

    return linhas[0] ?? null;
  }

  async buscarPorIds(ids: string[]): Promise<Map<string, RotaComCoordenadas>> {
    if (ids.length === 0) return new Map();

    const linhas = await this.prisma.$queryRaw<RotaComCoordenadas[]>`
      SELECT
        "id", "usuarioId", "origemNome", "origemEndereco", "destinoNome", "destinoEndereco",
        ST_Y("pontoOrigem"::geometry)  AS "origemLat",
        ST_X("pontoOrigem"::geometry)  AS "origemLng",
        ST_Y("pontoDestino"::geometry) AS "destinoLat",
        ST_X("pontoDestino"::geometry) AS "destinoLng"
      FROM "Rota"
      WHERE "id" = ANY(${ids}::uuid[])
    `;

    return new Map(linhas.map((linha) => [linha.id, linha]));
  }

  /**
   * Ids de rotas cuja origem e destino caem dentro do raio informado.
   * É isto que dá sentido ao PostGIS: "Centro" e "Rodoviária" viram a mesma
   * busca porque estão a poucas centenas de metros um do outro.
   */
  async idsProximos(params: {
    origemLat?: number;
    origemLng?: number;
    destinoLat?: number;
    destinoLng?: number;
    raioMetros: number;
  }): Promise<string[] | null> {
    const { origemLat, origemLng, destinoLat, destinoLng, raioMetros } = params;
    const temOrigem = typeof origemLat === 'number' && typeof origemLng === 'number';
    const temDestino = typeof destinoLat === 'number' && typeof destinoLng === 'number';

    // Sem filtro geográfico o chamador não deve restringir nada.
    if (!temOrigem && !temDestino) return null;

    const linhas = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Rota"
      WHERE
        (${!temOrigem}::boolean OR ST_DWithin(
          "pontoOrigem",
          ST_SetSRID(ST_MakePoint(${origemLng ?? 0}, ${origemLat ?? 0}), 4326)::geography,
          ${raioMetros}
        ))
        AND
        (${!temDestino}::boolean OR ST_DWithin(
          "pontoDestino",
          ST_SetSRID(ST_MakePoint(${destinoLng ?? 0}, ${destinoLat ?? 0}), 4326)::geography,
          ${raioMetros}
        ))
    `;

    return linhas.map((linha) => linha.id);
  }

  /** Distância do trajeto em km, mostrada no detalhe da carona. */
  async distanciaKm(rotaId: string): Promise<number | null> {
    const linhas = await this.prisma.$queryRaw<{ metros: number }[]>`
      SELECT ST_Distance("pontoOrigem", "pontoDestino") AS "metros"
      FROM "Rota" WHERE "id" = ${rotaId}::uuid
    `;

    const metros = linhas[0]?.metros;
    return typeof metros === 'number' ? Number((metros / 1000).toFixed(1)) : null;
  }
}
