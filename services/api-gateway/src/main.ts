import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import helmet from 'helmet';
import type { Express } from 'express';
import { logger } from '@shared/logger';

import { AppModule } from './app.module';
import { envService } from './config/env';
import { globalRateLimiter } from './infrastructure/security/rate-limit.middleware';
import { timeoutMiddleware } from './infrastructure/security/timeout.middleware';
import { headerValidationMiddleware } from './infrastructure/security/header-validation.middleware';
import { methodGuardMiddleware } from './infrastructure/security/method-guard.middleware';
import { pathSanitizerMiddleware } from './infrastructure/security/path-sanitizer.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpAdapter().getInstance() as Express;

  // 🔐 Trust proxy desde env
  server.set('trust proxy', envService.get('TRUST_PROXY'));

  app.setGlobalPrefix('api/v1');

  server.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  server.use(methodGuardMiddleware);
  server.use(pathSanitizerMiddleware);
  server.use(headerValidationMiddleware);
  server.use(globalRateLimiter);
  server.use(timeoutMiddleware);

  server.use(express.json({ limit: '1mb' }));
  server.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // CORS desde env validado
  app.enableCors({
    origin:
      envService.get('CORS_ORIGINS').length > 0
        ? envService.get('CORS_ORIGINS')
        : ['http://localhost:3000'],
    credentials: true,
  });

  const port = envService.get('PORT');
  await app.listen(port);

  logger.info(`🚀 API Gateway running on port ${port}`);
}

void bootstrap();
