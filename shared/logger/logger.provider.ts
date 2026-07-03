import { type Provider } from '@nestjs/common';

import { PLATFORM_LOGGER } from './logger.token';
import { PinoLoggerAdapter } from './pino.logger.adapter';

/**
 * Provider de Nest que resuelve {@link PLATFORM_LOGGER} a una instancia de
 * {@link PinoLoggerAdapter}, configurada a partir de variables de entorno:
 *
 * - `NODE_ENV=production` → nivel `info`; cualquier otro valor → `debug`.
 * - `SERVICE_NAME` → nombre del servicio (fallback `'unknown-service'` si no
 *   está seteada, para no atribuir logs al servicio equivocado por omisión).
 *
 * Ya viene registrado en {@link SharedModule}, por lo que los servicios no
 * necesitan declararlo manualmente salvo que quieran una configuración
 * distinta.
 */
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
