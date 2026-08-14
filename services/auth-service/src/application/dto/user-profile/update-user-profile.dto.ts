import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@domain/enums/document-type.enum';

/**
 * DTO para actualizar el perfil del usuario. Todos los campos son
 * opcionales — edición parcial, y así es como se completan
 * progresivamente `phone`/`documentType`/`documentNumber` antes de la
 * primera acción que los requiera (pagar, facturar, registrar empresa).
 */
export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'Juan', description: 'Nombre(s)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez', description: 'Apellido(s)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiPropertyOptional({ example: '3001234567', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{7,15}$/, { message: 'phone debe tener entre 7 y 15 dígitos' })
  phone?: string;

  @ApiPropertyOptional({ enum: DocumentType, description: 'Tipo de documento de identidad' })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({ example: '123456789', description: 'Número de documento' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  documentNumber?: string;
}
