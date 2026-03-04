import { LoggerProvider } from './logger.provider';
import { PinoLoggerAdapter } from './pino.logger.adapter';

type LoggerFactoryProvider = {
  useFactory: () => PinoLoggerAdapter;
};

describe('LoggerProvider', () => {
  const originalEnv = process.env;

  const buildLogger = () => {
    return (LoggerProvider as LoggerFactoryProvider).useFactory();
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('debe usar level "info" en producción', () => {
    process.env.NODE_ENV = 'production';
    process.env.SERVICE_NAME = 'billing-service';

    const logger = buildLogger();

    expect(logger).toBeInstanceOf(PinoLoggerAdapter);
  });

  it('debe usar level "debug" fuera de producción', () => {
    process.env.NODE_ENV = 'development';
    process.env.SERVICE_NAME = 'gateway';

    const logger = buildLogger();

    expect(logger).toBeInstanceOf(PinoLoggerAdapter);
  });

  it('debe usar fallback de serviceName', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.SERVICE_NAME;

    const logger = buildLogger();

    expect(logger).toBeInstanceOf(PinoLoggerAdapter);
  });
});