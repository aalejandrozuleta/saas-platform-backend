import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Body de `POST /notifications/email`.
 * `template` debe coincidir con una clave registrada en `TemplateEngine`;
 * si no existe, el envío falla dentro del job (no se valida acá contra la
 * lista de templates disponibles).
 */
export class SendEmailDto {
  /** `{ each: true }` valida cada dirección si `to` llega como array. */
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { each: true })
  to!: string | string[];

  @ApiProperty({ example: 'Bienvenido a la plataforma' })
  @IsString()
  @MinLength(1)
  subject!: string;

  @ApiProperty({ example: 'welcome', description: 'Nombre del template HTML' })
  @IsString()
  template!: string;

  @ApiPropertyOptional({ example: { name: 'Juan' } })
  @IsObject()
  @IsOptional()
  variables?: Record<string, unknown>;
}
