import { Provider } from "@nestjs/common";

import { PLATFORM_LOGGER } from "./logger.token";
import { PinoLoggerAdapter } from "./adapters/pino.logger.adapter";

export const LoggerProvider: Provider = {
  provide: PLATFORM_LOGGER,
  useFactory: () =>
    new PinoLoggerAdapter({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      serviceName: process.env.SERVICE_NAME ?? 'auth-service',
    }),
};
