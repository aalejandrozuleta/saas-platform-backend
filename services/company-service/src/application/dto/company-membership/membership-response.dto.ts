import { ApiProperty } from '@nestjs/swagger';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

/**
 * DTO de respuesta con los datos de una membresía.
 */
export class MembershipResponseDto {
  @ApiProperty({ example: '3c2b1a09-8f7e-6d5c-4b3a-2f1e0d9c8b7a' })
  id!: string;

  @ApiProperty({ example: '7f1b0f2e-9d4e-4d2a-9d0f-9a1b2c3d4e5f' })
  companyId!: string;

  @ApiProperty({ description: 'Id del usuario en auth-service' })
  userId!: string;

  @ApiProperty({ enum: MembershipRole })
  role!: MembershipRole;

  @ApiProperty({ enum: MembershipStatus })
  status!: MembershipStatus;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: Date;
}
