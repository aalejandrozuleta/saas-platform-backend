import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@saas/shared';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

/**
 * Punto de arranque del microservicio Notification.
 *
 * Configura:
 * - Prefijo global `/notifications`
 * - Versionado de API por URI
 * - Seguridad HTTP básica (helmet)
 * - Validaciones globales de DTOs
 * - Swagger en development
 * - Puerto vía ConfigService
 *
 * @remarks
 * Este bootstrap NO levanta los workers de BullMQ por separado: los
 * consumers (`EmailConsumer`, `WsConsumer`) se registran como providers de
 * Nest y arrancan junto con la app HTTP en el mismo proceso.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('notifications');
  app.use(cookieParser());

  /**
   * Versionado de API
   */
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  /**
   * Seguridad HTTP básica (OWASP)
   */
  app.use(
    helmet({
      contentSecurityPolicy: true,
    }),
  );

  /**
   * Validaciones globales: descarta propiedades no declaradas en los DTOs
   * y transforma los payloads entrantes a instancias de clase.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas
      forbidNonWhitelisted: true, // lanza error si envían campos extra
      transform: true, // transforma payloads a DTOs
    }),
  );

  /**
   * Permite cierre limpio del proceso (Docker / Kubernetes). Importante
   * aquí en particular para que los workers de BullMQ terminen los jobs
   * en curso antes de que el proceso muera.
   */
  app.enableShutdownHooks();

  if (configService.get<string>('NODE_ENV') === 'development') {
    setupSwagger(app, 'Notification Service');
  }

  /**
   * Puerto obtenido desde ConfigService (por defecto 3003).
   */
  const port = configService.get<number>('PORT') ?? 3003;
  await app.listen(port);
}

bootstrap();
