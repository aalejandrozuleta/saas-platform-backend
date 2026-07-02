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

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);
  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

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
  app.getHttpAdapter().getInstance().set('trust proxy', envService.get('TRUST_PROXY'));

  if (envService.get('NODE_ENV') === 'development') {
    setupSwagger(app, 'API Gateway');
  }

  await app.listen(envService.get('PORT'));
}

void bootstrap();
