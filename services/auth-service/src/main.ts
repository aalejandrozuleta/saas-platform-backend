import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { AppModule } from './app.module';

/**
 * Punto de arranque del microservicio Auth
 *
 * Configura:
 * - Versionado de API
 * - Seguridad HTTP
 * - Validaciones globales
 * - Puerto vía ConfigService
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  /**
   * Servicio centralizado de configuración
   * (env, validado previamente con Zod o Joi)
   */
  const configService = app.get(ConfigService);

  /**
   * Prefijo global del microservicio
   * Ejemplo final: /auth/v1/login
   */
  app.setGlobalPrefix('auth');

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
      contentSecurityPolicy: false,
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

  /**
   * Puerto obtenido desde ConfigService
   */
  const port = configService.get<number>('app.port') ?? 3001;

  await app.listen(port);
}

bootstrap();
