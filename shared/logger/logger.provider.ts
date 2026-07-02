import { type Provider } from '@nestjs/common';

import { PLATFORM_LOGGER } from './logger.token';
import { PinoLoggerAdapter } from './pino.logger.adapter';

export const LoggerProvider: Provider = {
  provide: PLATFORM_LOGGER,
  useFactory: () =>
    new PinoLoggerAdapter({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      // 'unknown-service' en vez de asumir un servicio específico: un
      // fallback como 'auth-service' aquí haría que logs de otro servicio
      // (ej. api-gateway) se atribuyan silenciosamente al servicio
      // equivocado si alguien olvida setear SERVICE_NAME.
      serviceName: process.env.SERVICE_NAME ?? 'unknown-service',
    }),
};
