import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerProvider } from './logger/logger.provider';
import { PLATFORM_LOGGER } from './logger/logger.token';
import { HttpRequestLoggingInterceptor } from './logger/http-request-logging.interceptor';

@Module({
  providers: [
    LoggerProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpRequestLoggingInterceptor,
    },
  ],
  exports: [PLATFORM_LOGGER],
})
export class SharedModule {}
