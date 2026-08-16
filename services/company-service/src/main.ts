import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@saas/shared';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

/**
 * Punto de arranque del microservicio Company
 *
 * Configura:
 * - Prefijo global `/company` y versionado de API
 * - Seguridad HTTP básica (helmet)
 * - Cookies (el `JwtAuthGuard` lee el accessToken desde la cookie)
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
  app.setGlobalPrefix('company');
  app.use(cookieParser());

  /**
   * Confía en exactamente 1 hop (api-gateway, el único cliente HTTP directo
   * de este servicio) para que Express resuelva req.ip a partir de
   * X-Forwarded-For en vez de la IP del socket.
   */
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

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
    setupSwagger(app, 'Company Service');
  }

  /**
   * Puerto obtenido desde ConfigService
   */
  const port = configService.get<number>('PORT') ?? 3004;
  await app.listen(port);
}

bootstrap();
