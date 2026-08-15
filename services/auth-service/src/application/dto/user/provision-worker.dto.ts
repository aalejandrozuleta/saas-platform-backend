import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el provisionamiento directo de un worker por parte de su
 * empresa (`POST /v1/users/provision`, endpoint interno consumido por
 * `company-service`).
 */
export class ProvisionWorkerDto {
  @ApiProperty({ example: 'María', description: 'Nombre(s) del worker' })
  @IsString()
  @MinLength(1)
  firstName!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido(s) del worker' })
  @IsString()
  @MinLength(1)
  lastName!: string;

  @ApiProperty({
    example: 'contacto@empresa.com',
    description: 'Email real al que se envían las credenciales generadas',
  })
  @IsEmail()
  contactEmail!: string;

  @ApiProperty({
    example: 'Acme Corp',
    description: 'Nombre de la empresa que provisiona al worker',
  })
  @IsString()
  @MinLength(1)
  companyName!: string;
}
