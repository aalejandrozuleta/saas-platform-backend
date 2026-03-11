import { randomUUID } from 'node:crypto';

import { sign, verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@application/ports/token.service.token';
import { EnvService } from '@config/env/env.service';

/**
 * Implementación JWT del servicio de tokens.
 *
 * Responsabilidades:
 * - Generar access tokens
 * - Generar refresh tokens
 * - Calcular expiraciones basadas en configuración
 */
@Injectable()
export class JwtTokenService implements TokenService {

  constructor(
    private readonly envService: EnvService,
  ) { }

  /**
   * Genera access token firmado.
   */
  generateAccessToken(payload: {
    userId: string;
    sessionId: string;
  }): string {

    const ttl = Number(this.envService.get('ACCESS_TOKEN_TTL'));

    return sign(
      {
        sub: payload.userId,
        sid: payload.sessionId,
      },
      this.envService.get('JWT_ACCESS_SECRET'),
      {
        expiresIn: ttl,
        issuer: 'auth-service',
        audience: 'api-gateway',
      },
    );
  }

  /**
   * Genera refresh token con jti único.
   */
  generateRefreshToken(): {
    token: string;
    jti: string;
    expiresAt: Date;
  } {

    const jti = randomUUID();

    const ttl = Number(
      this.envService.get('REFRESH_TOKEN_TTL'),
    );

    const expiresAt = new Date(
      Date.now() + ttl * 1000,
    );

    const token = sign(
      { jti },
      this.envService.get('JWT_REFRESH_SECRET'),
      {
        expiresIn: ttl,
        issuer: 'auth-service',
      },
    );

    return {
      token,
      jti,
      expiresAt,
    };
  }

  verifyRefreshToken(token: string): { jti: string } {
    const payload = verify(
      token,
      this.envService.get('JWT_REFRESH_SECRET'),
    ) as { jti: string };

    return payload;
  }
}