import { randomUUID } from 'node:crypto';

import { sign } from 'jsonwebtoken';
import { EnvService } from '@config/env/env.service';

import { JwtTokenService } from './jwt-token.service';

jest.mock('jsonwebtoken');
jest.mock('node:crypto');

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let envService: jest.Mocked<EnvService>;

  beforeEach(() => {
    envService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return undefined;
      }),
    } as unknown as jest.Mocked<EnvService>;

    service = new JwtTokenService(envService);

    process.env.JWT_ACCESS_SECRET = 'access-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';

    jest.clearAllMocks();
  });

  afterEach(() => {
  jest.restoreAllMocks();
});

  describe('generateAccessToken', () => {
    it('debe generar un access token con el payload correcto', () => {
      (sign as jest.Mock).mockReturnValue('access-token');

      const result = service.generateAccessToken({
        userId: 'user-1',
        sessionId: 'session-1',
      });

      expect(sign).toHaveBeenCalledWith(
        {
          userId: 'user-1',
          sessionId: 'session-1',
        },
        'access-secret',
        { expiresIn: '15m' },
      );

      expect(result).toBe('access-token');
    });
  });

  describe('generateRefreshToken', () => {
    it('debe generar refresh token con jti y expiración', () => {
      (randomUUID as jest.Mock).mockReturnValue('uuid-123');

      (sign as jest.Mock).mockReturnValue('refresh-token');

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = service.generateRefreshToken();

      expect(sign).toHaveBeenCalledWith(
        { jti: 'uuid-123' },
        'refresh-secret',
        { expiresIn: '7d' },
      );

      expect(result.token).toBe('refresh-token');
      expect(result.jti).toBe('uuid-123');

      expect(result.expiresAt.getTime()).toBe(
        now + 1000 * 60 * 60 * 24 * 7,
      );
    });
  });
});