import { randomUUID } from 'node:crypto';

import { sign, verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@application/ports/token.service.token';
import { UserRole } from '@domain/enums/user-role.enum';
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
  constructor(private readonly envService: EnvService) {}

  /**
   * Genera access token firmado.
   */
  generateAccessToken(payload: { userId: string; sessionId: string; role: UserRole }): string {
    const ttl = Number(this.envService.get('ACCESS_TOKEN_TTL'));

    return sign(
      {
        sub: payload.userId,
        sid: payload.sessionId,
        role: payload.role,
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

    const ttl = Number(this.envService.get('REFRESH_TOKEN_TTL'));

    const expiresAt = new Date(Date.now() + ttl * 1000);

    const token = sign({ jti }, this.envService.get('JWT_REFRESH_SECRET'), {
      expiresIn: ttl,
      issuer: 'auth-service',
    });

    return {
      token,
      jti,
      expiresAt,
    };
  }

  verifyRefreshToken(token: string): { jti: string } {
    const payload = verify(token, this.envService.get('JWT_REFRESH_SECRET'), {
      algorithms: ['HS256'],
    }) as { jti: string };

    return payload;
  }

  /**
   * Genera un challenge token de MFA firmado con `JWT_ACCESS_SECRET` pero
   * con `audience: 'mfa-challenge'` distinto al de los access tokens
   * (`api-gateway`), de modo que un access token normal nunca pueda
   * reutilizarse como challenge token ni viceversa.
   */
  generateChallengeToken(payload: {
    userId: string;
    deviceFingerprint?: string;
    country?: string;
    reason: string;
  }): string {
    const ttl = Number(this.envService.get('MFA_CHALLENGE_TTL'));

    return sign(
      {
        sub: payload.userId,
        fp: payload.deviceFingerprint,
        country: payload.country,
        reason: payload.reason,
      },
      this.envService.get('JWT_ACCESS_SECRET'),
      {
        expiresIn: ttl,
        issuer: 'auth-service',
        audience: 'mfa-challenge',
      },
    );
  }

  verifyChallengeToken(token: string): {
    userId: string;
    deviceFingerprint?: string;
    country?: string;
    reason: string;
  } {
    const payload = verify(token, this.envService.get('JWT_ACCESS_SECRET'), {
      algorithms: ['HS256'],
      audience: 'mfa-challenge',
      issuer: 'auth-service',
    }) as { sub: string; fp?: string; country?: string; reason: string };

    return {
      userId: payload.sub,
      deviceFingerprint: payload.fp,
      country: payload.country,
      reason: payload.reason,
    };
  }
}
