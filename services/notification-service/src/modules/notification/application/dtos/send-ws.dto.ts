import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Body de `POST /notifications/ws`.
 * `event` es un nombre libre que el cliente WS usa para distinguir el tipo
 * de mensaje (ver `WsNotificationsGateway`); no se valida contra una lista
 * cerrada de eventos.
 */
export class SendWsDto {
  @ApiProperty({ example: 'maintenance.scheduled' })
  @IsString()
  event!: string;

  /** `broadcast` envía a todos los clientes conectados; `user` requiere `userId`. */
  @ApiProperty({ enum: ['broadcast', 'user'], example: 'broadcast' })
  @IsIn(['broadcast', 'user'])
  target!: 'broadcast' | 'user';

  /** Requerido cuando `target === 'user'`; no se valida esa dependencia acá (queda a cargo del consumer/gateway). */
  @ApiPropertyOptional({ example: 'user-uuid-123', description: 'Requerido cuando target=user' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: { message: 'El sistema estará en mantenimiento a las 3am' } })
  @IsObject()
  data!: Record<string, unknown>;
}
