import { IsEmail, IsIn, MaxLength, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipRole } from '@domain/enums/membership-role.enum';

/** Roles permitidos al registrar un trabajador directamente: nunca OWNER. */
const REGISTERABLE_ROLES = [MembershipRole.MANAGER, MembershipRole.WORKER] as const;

/**
 * DTO para registrar (provisionar) un trabajador **nuevo** en auth-service y
 * darlo de alta como miembro `ACTIVE` de la empresa en un solo paso.
 */
export class RegisterWorkerDto {
  @ApiProperty({ example: 'Juana', description: 'Nombre del trabajador' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del trabajador' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({
    example: 'trabajador@example.com',
    description: 'Email de contacto donde se le enviarán las credenciales de acceso',
  })
  @IsEmail()
  contactEmail!: string;

  @ApiProperty({ enum: REGISTERABLE_ROLES, example: MembershipRole.WORKER })
  @IsIn(REGISTERABLE_ROLES)
  role!: MembershipRole;
}
