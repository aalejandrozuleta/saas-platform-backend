import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import express from 'express';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { setupSwagger } from '@saas/shared';

import { AppModule } from './app.module';
import { methodGuardMiddleware } from './infrastructure/security/method-guard.middleware';
import { pathSanitizerMiddleware } from './infrastructure/security/path-sanitizer.middleware';
import { headerValidationMiddleware } from './infrastructure/security/header-validation.middleware';
import {
  authRateLimiter,
  globalRateLimiter,
} from './infrastructure/security/rate-limit.middleware';
import { timeoutMiddleware } from './infrastructure/security/timeout.middleware';
import { EnvService } from './config/env/env.service';

/**
 * Punto de arranque del API Gateway.
 *
 * @remarks
 * El gateway es el único punto de entrada público de la plataforma, por lo
 * que el orden de configuración de middlewares es crítico para la seguridad:
 *
 * 1. `cookieParser` — necesario para leer `accessToken` antes de cualquier
 *    validación de sesión (guards que corren después, a nivel de Nest).
 * 2. `enableVersioning` — resuelve el prefijo `/v1` antes de que las rutas
 *    se registren.
 * 3. `enableCors` — se resuelve antes que helmet para no interferir con las
 *    cabeceras CORS que helmet también puede tocar.
 * 4. `helmet` — cabeceras de seguridad HTTP base (OWASP).
 * 5. `methodGuardMiddleware` — rechaza verbos HTTP no soportados antes de
 *    que lleguen a cualquier lógica de negocio o parsing de body.
 * 6. `pathSanitizerMiddleware` — bloquea path traversal antes de que el path
 *    se use para enrutar o para construir la URL upstream.
 * 7. `headerValidationMiddleware` — valida `Content-Type` antes de parsear
 *    el body, evitando parsers innecesarios sobre payloads inválidos.
 * 8. `globalRateLimiter` — limita el tráfico general por IP.
 * 9. `authRateLimiter` — limitador más estricto, aplicado SOLO sobre las
 *    rutas de autenticación sensibles (login, register, refresh, etc.) para
 *    mitigar fuerza bruta y credential stuffing; se registra después del
 *    limiter global para que ambos apliquen en cascada sobre esas rutas.
 * 10. `timeoutMiddleware` — corta la respuesta si el proxy hacia un servicio
 *     downstream se cuelga, evitando agotar el pool de conexiones del gateway.
 * 11. `express.json` / `express.urlencoded` — el parsing de body se registra
 *     al final a propósito: solo debe ejecutarse sobre requests que ya
 *     pasaron todos los filtros de seguridad anteriores (método, path,
 *     headers, rate limit y timeout), minimizando el trabajo gastado en
 *     requests maliciosas o inválidas.
 *
 * Alterar este orden puede reabrir vectores de ataque (p. ej. parsear body
 * antes del rate limiting permite floodear el gateway con payloads grandes
 * sin ser limitado).
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);
  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Si CORS_ORIGINS no está configurada, se usa localhost:3000 como fallback
  // de desarrollo (nunca debe llegar vacío a producción; validar en el env).
  app.enableCors({
    origin:
      envService.get('CORS_ORIGINS').length > 0
        ? envService.get('CORS_ORIGINS')
        : ['http://localhost:3000'],
    credentials: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(methodGuardMiddleware);
  app.use(pathSanitizerMiddleware);
  app.use(headerValidationMiddleware);
  app.use(globalRateLimiter);
  // Rutas sensibles a fuerza bruta / abuso de credenciales: además del
  // límite global, reciben el límite estricto de authRateLimiter.
  app.use(
    [
      '/auth/v1/login',
      '/auth/v1/register',
      '/auth/v1/refresh',
      '/auth/v1/resend-verification',
      '/auth/v1/verify-email',
      '/auth/v1/2fa/verify',
      '/auth/v1/change-password',
    ],
    authRateLimiter,
  );
  app.use(timeoutMiddleware);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  // TRUST_PROXY: cuántos hops de proxy confiar (típicamente 1 = nginx) para
  // que Express resuelva req.ip desde X-Forwarded-For y no desde el socket.
  // De este req.ip depende forwardHeaders() al reenviar a los servicios
  // downstream (ver header-forwarder.util.ts).
  app.getHttpAdapter().getInstance().set('trust proxy', envService.get('TRUST_PROXY'));

  if (envService.get('NODE_ENV') === 'development') {
    setupSwagger(app, 'API Gateway');
  }

  await app.listen(envService.get('PORT'));
}

void bootstrap();
