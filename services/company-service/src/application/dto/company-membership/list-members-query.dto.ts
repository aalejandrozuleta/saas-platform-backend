import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

export const DEFAULT_MEMBERS_PAGE_SIZE = 20;
export const MAX_MEMBERS_PAGE_SIZE = 100;

/**
 * Query params de `GET /companies/:id/members`: paginación y filtros
 * opcionales por rol/estado.
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

  @ApiPropertyOptional({ enum: MembershipRole, description: 'Filtra por rol' })
  @IsOptional()
  @IsEnum(MembershipRole)
  role?: MembershipRole;

  @ApiPropertyOptional({
    enum: MembershipStatus,
    description: 'Filtra por estado (ej. INVITED para ver invitaciones pendientes)',
  })
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}
