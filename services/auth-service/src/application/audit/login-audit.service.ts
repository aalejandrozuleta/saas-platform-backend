import { Inject, Injectable } from '@nestjs/common';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

import { AuthAuditEvent } from './auth-events.enum';

/**
 * Servicio de aplicación encargado de traducir
 * eventos del dominio Login en registros de auditoría.
 *
 * No conoce Mongo.
 * No conoce infraestructura.
 * Solo depende del puerto AuditLogger.
 */
@Injectable()
export class LoginAuditService {
  constructor(
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  /**
   * Registra intento de login
   */
  async loginAttempted(
    email: string,
    context: LoginContext,
  ): Promise<void> {
    await this.auditLogger.log({
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_ATTEMPT,
      userId: null,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
      metadata: {
        email,
      },
    });
  }

  /**
   * Registra login exitoso
   */
  async loginSucceeded(
    userId: string,
    context: LoginContext,
    sessionId: string,
  ): Promise<void> {
    await this.auditLogger.log({
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_SUCCESS,
      userId,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
      metadata: {
        sessionId,
      },
    });
  }

  /**
   * Registra login fallido
   */
  async loginFailed(
    userId: string | null,
    context: LoginContext,
    reason: string,
  ): Promise<void> {
    await this.auditLogger.log({
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_FAILED,
      userId,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
      reason,
    });
  }

  /**
   * Registra bloqueo de usuario
   */
  async loginBlocked(
    userId: string,
    context: LoginContext,
    blockedUntil?: Date,
  ): Promise<void> {
    await this.auditLogger.log({
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_BLOCKED,
      userId,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
      metadata: {
        blockedUntil,
      },
    });
  }

  /**
   * Registra dispositivo no confiable
   */
  async deviceNotTrusted(
    userId: string,
    context: LoginContext,
  ): Promise<void> {
    await this.auditLogger.log({
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_DEVICE_NOT_TRUSTED,
      userId,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
    });
  }

  /**
   * Registra país no confiable
   */
  async countryNotTrusted(
    userId: string,
    context: LoginContext,
  ): Promise<void> {
    await this.auditLogger.log({
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_COUNTRY_NOT_TRUSTED,
      userId,
      ip: context.ip,
      country: context.country,
      deviceFingerprint: context.deviceFingerprint,
    });
  }
}
