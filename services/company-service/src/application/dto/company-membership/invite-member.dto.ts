import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipRole } from '@domain/enums/membership-role.enum';

/**
 * DTO para invitar a un usuario **ya registrado** en auth-service a una
 * empresa. company-service resuelve el `userId` a partir del email.
 */
export class InviteMemberDto {
  @ApiProperty({ example: 'trabajador@example.com', description: 'Email del usuario a invitar' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: MembershipRole, example: MembershipRole.WORKER })
  @IsEnum(MembershipRole)
  role!: MembershipRole;
}
