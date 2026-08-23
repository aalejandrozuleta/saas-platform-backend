import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const DEFAULT_MEMBERS_PAGE_SIZE = 20;
export const MAX_MEMBERS_PAGE_SIZE = 100;

/**
 * Query params de paginación para `GET /companies/:id/members`.
 *
 * @remarks
 * Sin paginación, una empresa con cientos de miembros devolvía la lista
 * completa en una sola respuesta. `limit` está acotado a
 * {@link MAX_MEMBERS_PAGE_SIZE} para que un cliente no pueda forzar un
 * `limit` arbitrariamente grande y anular el propósito de paginar.
 */
export class ListMembersQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Número de página (1-indexado)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: DEFAULT_MEMBERS_PAGE_SIZE,
    default: DEFAULT_MEMBERS_PAGE_SIZE,
    description: `Cantidad de miembros por página (máx. ${MAX_MEMBERS_PAGE_SIZE})`,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_MEMBERS_PAGE_SIZE)
  limit: number = DEFAULT_MEMBERS_PAGE_SIZE;
}
