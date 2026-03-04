import { randomUUID } from 'node:crypto';

import { sign } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@application/ports/token.service';
import { EnvService } from '@config/env/env.service';

/**
 * Implementación JWT del servicio de tokens.
 */
@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly envService: EnvService) {}

  generateAccessToken(payload: {
    userId: string;
    sessionId: string;
  }): string {
    return sign(payload, this.envService.get('JWT_ACCESS_SECRET')!, {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(): {
    token: string;
    jti: string;
    expiresAt: Date;
  } {
    const jti = randomUUID();

    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7,
    );

    const token = sign(
      { jti },
      this.envService.get('JWT_REFRESH_SECRET')!,
      { expiresIn: '7d' },
    );

    return {
      token,
      jti,
      expiresAt,
    };
  }
}
