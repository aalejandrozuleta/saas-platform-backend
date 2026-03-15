import type { CreateActivityReport } from '@saas/shared';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { LoginContext } from '@domain/value-objects/login-context.vo';

import { AuthAuditEvent } from './auth-events.enum';

const AUTH_SERVICE_NAME = 'auth-service';

export class AuthActivityReportFactory {
  static loginAttempted(
    email: string,
    context: LoginContext,
  ): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.LOGIN_ATTEMPT,
      outcome: 'INFO',
      summary: 'Intento de inicio de sesión',
      actor: {
        type: 'ANONYMOUS',
        email,
      },
      context,
      metadata: {
        email,
      },
    });
  }

  static loginSucceeded(
    userId: string,
    context: LoginContext,
    sessionId: string,
  ): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.LOGIN_SUCCESS,
      outcome: 'SUCCESS',
      summary: 'Inicio de sesión exitoso',
      actor: {
        type: 'USER',
        id: userId,
      },
      context,
      metadata: {
        sessionId,
      },
    });
  }

  static loginFailed(
    userId: string | null,
    email: string | undefined,
    context: LoginContext,
    reason: string,
  ): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.LOGIN_FAILED,
      outcome: 'FAILURE',
      summary: this.resolveLoginFailureSummary(reason),
      actor: {
        type: userId ? 'USER' : 'ANONYMOUS',
        id: userId,
        email,
      },
      context,
      reason,
    });
  }

  static loginBlocked(
    userId: string,
    context: LoginContext,
    blockedUntil?: Date,
  ): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.LOGIN_BLOCKED,
      outcome: 'BLOCKED',
      summary: 'Usuario bloqueado por demasiados intentos fallidos',
      actor: {
        type: 'USER',
        id: userId,
      },
      context,
      metadata: {
        blockedUntil,
      },
    });
  }

  static deviceNotTrusted(
    userId: string,
    context: LoginContext,
  ): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.LOGIN_DEVICE_NOT_TRUSTED,
      outcome: 'REJECTED',
      summary: 'Intento de acceso desde un dispositivo no confiable',
      actor: {
        type: 'USER',
        id: userId,
      },
      context,
    });
  }

  static countryNotTrusted(
    userId: string,
    context: LoginContext,
  ): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.LOGIN_COUNTRY_NOT_TRUSTED,
      outcome: 'REJECTED',
      summary: 'Intento de acceso desde un país no confiable',
      actor: {
        type: 'USER',
        id: userId,
      },
      context,
    });
  }

  static registerSuccess(input: {
    userId: string;
    email: string;
    ip: string;
    country?: string;
    deviceFingerprint?: string;
  }): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.REGISTER_SUCCESS,
      outcome: 'SUCCESS',
      summary: 'Registro de usuario exitoso',
      actor: {
        type: 'USER',
        id: input.userId,
        email: input.email,
      },
      context: {
        ip: input.ip,
        country: input.country,
        deviceFingerprint: input.deviceFingerprint,
      },
      metadata: {
        email: input.email,
      },
    });
  }

  static registerFailed(input: {
    userId?: string | null;
    email: string;
    reason: string;
    ip: string;
    country?: string;
    deviceFingerprint?: string;
  }): CreateActivityReport {
    return this.createReport({
      action: AuthAuditEvent.REGISTER_FAILED,
      outcome: 'FAILURE',
      summary: 'Registro de usuario fallido',
      actor: {
        type: input.userId ? 'USER' : 'ANONYMOUS',
        id: input.userId ?? null,
        email: input.email,
      },
      context: {
        ip: input.ip,
        country: input.country,
        deviceFingerprint: input.deviceFingerprint,
      },
      reason: input.reason,
    });
  }

  private static createReport(
    input: Omit<CreateActivityReport, 'service' | 'category' | 'context'> & {
      context?:
        | LoginContext
        | {
            ip?: string;
            country?: string;
            deviceFingerprint?: string;
          };
    },
  ): CreateActivityReport {
    return {
      service: AUTH_SERVICE_NAME,
      category: AuditCategory.AUTH,
      action: input.action,
      outcome: input.outcome,
      summary: input.summary,
      actor: input.actor,
      context: input.context
        ? this.normalizeContext(input.context)
        : undefined,
      reason: input.reason,
      metadata: input.metadata,
    };
  }

  private static normalizeContext(
    context:
      | LoginContext
      | {
          ip?: string;
          country?: string;
          deviceFingerprint?: string;
        },
  ) {
    if (context instanceof LoginContext) {
      return {
        ip: context.ip,
        country: context.country,
        deviceFingerprint: context.deviceFingerprint,
      };
    }

    return context;
  }

  private static resolveLoginFailureSummary(reason: string): string {
    switch (reason) {
      case 'INVALID_PASSWORD':
      case 'INVALID_CREDENTIALS':
        return 'Inicio de sesión fallido por contraseña incorrecta';
      case 'EMAIL_NOT_FOUND':
        return 'Inicio de sesión fallido porque el correo no existe';
      default:
        return 'Inicio de sesión fallido';
    }
  }
}
