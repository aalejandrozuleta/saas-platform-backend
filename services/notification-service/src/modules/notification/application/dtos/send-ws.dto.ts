import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class SendWsDto {
  @ApiProperty({ example: 'maintenance.scheduled' })
  @IsString()
  event!: string;

  @ApiProperty({ enum: ['broadcast', 'user'], example: 'broadcast' })
  @IsIn(['broadcast', 'user'])
  target!: 'broadcast' | 'user';

  @ApiPropertyOptional({ example: 'user-uuid-123', description: 'Requerido cuando target=user' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: { message: 'El sistema estará en mantenimiento a las 3am' } })
  @IsObject()
  data!: Record<string, unknown>;
}
