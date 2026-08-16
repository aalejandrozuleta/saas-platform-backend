import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

/**
 * DTO para cambiar el rol y/o el estado de un miembro de la empresa.
 */
export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: MembershipRole })
  @IsOptional()
  @IsEnum(MembershipRole)
  role?: MembershipRole;

  @ApiPropertyOptional({ enum: MembershipStatus })
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}
