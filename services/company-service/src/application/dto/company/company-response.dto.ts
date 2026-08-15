import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyPlan } from '@domain/enums/company-plan.enum';

/**
 * DTO de respuesta con los datos públicos de una empresa.
 */
export class CompanyResponseDto {
  @ApiProperty({ example: '7f1b0f2e-9d4e-4d2a-9d0f-9a1b2c3d4e5f' })
  id!: string;

  @ApiProperty({ example: 'Distribuidora El Sol S.A.S.' })
  name!: string;

  @ApiPropertyOptional({ example: '900123456-7' })
  taxId?: string;

  @ApiProperty({ example: 'contacto@elsol.com' })
  email!: string;

  @ApiProperty({ example: '+57 3001234567' })
  phone!: string;

  @ApiProperty({ example: 'Calle 123 # 45-67' })
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  city!: string;

  @ApiProperty({ example: 'CO' })
  country!: string;

  @ApiPropertyOptional({ example: 'http://localhost:9000/company-logos/logos/c-1.webp' })
  logoUrl?: string;

  @ApiProperty({ enum: CompanyPlan, example: CompanyPlan.STARTER })
  plan!: CompanyPlan;

  @ApiProperty({ example: 'active' })
  subscriptionStatus!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: Date;
}
