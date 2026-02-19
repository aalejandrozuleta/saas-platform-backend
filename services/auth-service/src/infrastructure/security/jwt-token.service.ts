import { randomUUID } from 'node:crypto';

import { sign } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@application/ports/token.service';

/**
 * Implementación JWT del servicio de tokens.
 */
@Injectable()
export class JwtTokenService implements TokenService {

  generateAccessToken(payload: {
    userId: string;
    sessionId: string;
  }): string {
    return sign(payload, process.env.JWT_ACCESS_SECRET!, {
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
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    );

    return {
      token,
      jti,
      expiresAt,
    };
  }
}
