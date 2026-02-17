import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { AuthAuditEvent } from '@domain/audit/auth-events.enum';
import { LoginContext } from '@domain/value-objects/login-context.vo';


/**
 * Servicio de aplicación responsable de
 * traducir eventos de login en registros de auditoría.
 *
 * No conoce Mongo.
 * No conoce infraestructura.
 * Solo usa el puerto AuditLogger.
 */
export class LoginAuditService {
  constructor(
    private readonly auditLogger: AuditLogger,
  ) {}

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
      metadata: {
        ...context.toAuditMetadata(),
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
      metadata: {
        ...context.toAuditMetadata(),
        reason,
      },
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
      metadata: {
        ...context.toAuditMetadata(),
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
      metadata: context.toAuditMetadata(),
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
      metadata: context.toAuditMetadata(),
    });
  }
}
