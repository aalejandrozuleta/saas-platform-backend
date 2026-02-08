import { Module } from '@nestjs/common';

import { LoggerProvider } from './logger/logger.provider';
import { PLATFORM_LOGGER } from './logger/logger.token';

@Module({
  providers: [LoggerProvider],
  exports: [PLATFORM_LOGGER], // 👈 CLAVE
})
export class SharedModule {}
