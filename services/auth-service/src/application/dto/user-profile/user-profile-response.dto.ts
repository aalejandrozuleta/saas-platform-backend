import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@domain/enums/document-type.enum';

/**
 * DTO de respuesta con los datos del perfil del usuario.
 */
export class UserProfileResponseDto {
  @ApiProperty({ example: 'Juan' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  lastName!: string;

  @ApiPropertyOptional({ example: '3001234567' })
  phone?: string;

  @ApiPropertyOptional({ enum: DocumentType })
  documentType?: DocumentType;

  @ApiPropertyOptional({ example: '123456789' })
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/avatars/user-1.png' })
  avatarUrl?: string;

  @ApiProperty({
    example: true,
    description: 'true si ya tiene teléfono y documento — requisito para pagar/facturar',
  })
  isCompleteForTransactions!: boolean;
}
