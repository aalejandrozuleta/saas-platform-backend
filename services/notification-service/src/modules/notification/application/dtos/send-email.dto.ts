import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class SendEmailDto {
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
