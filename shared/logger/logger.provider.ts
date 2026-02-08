import { Provider } from '@nestjs/common';

import { PLATFORM_LOGGER } from './logger.token';
import { PinoLoggerAdapter } from './adapters/pino.logger.adapter';


export const LoggerProvider: Provider = {
  provide: PLATFORM_LOGGER,
  useFactory: () =>
    new PinoLoggerAdapter({
      level: 'info',
      serviceName: 'auth-service',
    }),
};
