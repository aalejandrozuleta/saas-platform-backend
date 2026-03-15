import { Inject, Injectable } from '@nestjs/common';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

import { AuthActivityReportFactory } from './auth-activity-report.factory';

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
    await this.auditLogger.log(
      AuthActivityReportFactory.loginAttempted(email, context),
    );
  }

  /**
   * Registra login exitoso
   */
  async loginSucceeded(
    userId: string,
    context: LoginContext,
    sessionId: string,
  ): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.loginSucceeded(
        userId,
        context,
        sessionId,
      ),
    );
  }

  /**
   * Registra login fallido
   */
  async loginFailed(
    userId: string | null,
    context: LoginContext,
    reason: string,
    email?: string,
  ): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.loginFailed(
        userId,
        email,
        context,
        reason,
      ),
    );
  }

  /**
   * Registra bloqueo de usuario
   */
  async loginBlocked(
    userId: string,
    context: LoginContext,
    blockedUntil?: Date,
  ): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.loginBlocked(
        userId,
        context,
        blockedUntil,
      ),
    );
  }

  /**
   * Registra dispositivo no confiable
   */
  async deviceNotTrusted(
    userId: string,
    context: LoginContext,
  ): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.deviceNotTrusted(
        userId,
        context,
      ),
    );
  }

  /**
   * Registra país no confiable
   */
  async countryNotTrusted(
    userId: string,
    context: LoginContext,
  ): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.countryNotTrusted(
        userId,
        context,
      ),
    );
  }
}
