import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@saas/shared';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

/**
 * Punto de arranque del microservicio Config
 *
 * Configura:
 * - Prefijo global `/config` y versionado de API
 * - Seguridad HTTP básica (helmet)
 * - Validaciones globales de DTOs
 * - Swagger (solo en development)
 * - Puerto vía ConfigService
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  /**
   * Servicio centralizado de configuración de NestJS
   * (no confundir con `EnvService`, que valida las variables con Zod)
   */
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('config');
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
   * Validaciones globales
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas
      forbidNonWhitelisted: true, // lanza error si envían campos extra
      transform: true, // transforma payloads a DTOs
    }),
  );

  /**
   * Permite cierre limpio del proceso (Docker / Kubernetes)
   */
  app.enableShutdownHooks();

  if (configService.get<string>('NODE_ENV') === 'development') {
    setupSwagger(app, 'Config Service');
  }

  /**
   * Puerto obtenido desde ConfigService
   */
  const port = configService.get<number>('PORT') ?? 3002;
  await app.listen(port);
}

bootstrap();
