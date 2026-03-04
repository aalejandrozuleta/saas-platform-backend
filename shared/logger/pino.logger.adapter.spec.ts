import pino from 'pino';

import { PinoLoggerAdapter } from './pino.logger.adapter';

jest.mock('pino');

describe('PinoLoggerAdapter', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (pino as unknown as jest.Mock).mockReturnValue(mockLogger);
  });

  const createLogger = () =>
    new PinoLoggerAdapter({
      level: 'debug',
      serviceName: 'test-service',
    });

  it('debe crear una instancia de logger', () => {
    const logger = createLogger();

    expect(logger).toBeInstanceOf(PinoLoggerAdapter);
    expect(pino).toHaveBeenCalled();
  });

  describe('info', () => {
    it('debe loggear mensaje sin metadata', () => {
      const logger = createLogger();

      logger.info('hello');

      expect(mockLogger.info).toHaveBeenCalledWith('hello');
    });

    it('debe loggear mensaje con metadata', () => {
      const logger = createLogger();

      logger.info('hello', { userId: 1 });

      expect(mockLogger.info).toHaveBeenCalledWith(
        { userId: 1 },
        'hello',
      );
    });
  });

  describe('warn', () => {
    it('debe loggear mensaje sin metadata', () => {
      const logger = createLogger();

      logger.warn('warning');

      expect(mockLogger.warn).toHaveBeenCalledWith('warning');
    });

    it('debe loggear mensaje con metadata', () => {
      const logger = createLogger();

      logger.warn('warning', { scope: 'auth' });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        { scope: 'auth' },
        'warning',
      );
    });
  });

  describe('error', () => {
    it('debe loggear error con instancia Error', () => {
      const logger = createLogger();
      const err = new Error('boom');

      logger.error('failed', err as any);

      expect(mockLogger.error).toHaveBeenCalledWith(err, 'failed');
    });

    it('debe loggear error con metadata', () => {
      const logger = createLogger();

      logger.error('failed', { id: 1 });

      expect(mockLogger.error).toHaveBeenCalledWith(
        { id: 1 },
        'failed',
      );
    });

    it('debe loggear error sin metadata', () => {
      const logger = createLogger();

      logger.error('failed');

      expect(mockLogger.error).toHaveBeenCalledWith('failed');
    });
  });

  describe('debug', () => {
    it('debe loggear debug sin metadata', () => {
      const logger = createLogger();

      logger.debug('debug message');

      expect(mockLogger.debug).toHaveBeenCalledWith('debug message');
    });

    it('debe loggear debug con metadata', () => {
      const logger = createLogger();

      logger.debug('debug message', { test: true });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        { test: true },
        'debug message',
      );
    });
  });
});