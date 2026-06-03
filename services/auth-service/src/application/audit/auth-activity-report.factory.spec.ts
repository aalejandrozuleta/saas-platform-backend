import { LoginContext } from '@domain/value-objects/login-context.vo';
import { LoginChallengeReason } from '@application/security/login-challenge.types';

import { AuthAuditEvent } from './auth-events.enum';
import { AuthActivityReportFactory } from './auth-activity-report.factory';

describe('AuthActivityReportFactory', () => {
  const context = LoginContext.create({
    ip: '127.0.0.1',
    country: 'CO',
    deviceFingerprint: 'device-123',
  });

  it('debe construir reporte de login fallido con resumen legible', () => {
    const report = AuthActivityReportFactory.loginFailed(
      'user-1',
      'user@example.com',
      context,
      'INVALID_PASSWORD',
    );

    expect(report).toEqual({
      service: 'auth-service',
      category: 'AUTH',
      action: AuthAuditEvent.LOGIN_FAILED,
      outcome: 'FAILURE',
      summary:
        'Inicio de sesión fallido por contraseña incorrecta',
      actor: {
        type: 'USER',
        id: 'user-1',
        email: 'user@example.com',
      },
      context: {
        ip: '127.0.0.1',
        country: 'CO',
        deviceFingerprint: 'device-123',
      },
      reason: 'INVALID_PASSWORD',
      metadata: undefined,
    });
  });

  it('debe construir reporte de registro exitoso', () => {
    const report = AuthActivityReportFactory.registerSuccess({
      userId: 'user-2',
      email: 'new@example.com',
      ip: '10.0.0.1',
      country: 'MX',
      deviceFingerprint: 'device-456',
    });

    expect(report).toEqual({
      service: 'auth-service',
      category: 'AUTH',
      action: AuthAuditEvent.REGISTER_SUCCESS,
      outcome: 'SUCCESS',
      summary: 'Registro de usuario exitoso',
      actor: {
        type: 'USER',
        id: 'user-2',
        email: 'new@example.com',
      },
      context: {
        ip: '10.0.0.1',
        country: 'MX',
        deviceFingerprint: 'device-456',
      },
      metadata: {
        email: 'new@example.com',
      },
    });
  });

  it('debe construir reporte de cambio de contraseña exitoso', () => {
    const report = AuthActivityReportFactory.passwordChanged({
      userId: 'user-4',
      ip: '192.168.1.1',
      country: 'CO',
    });

    expect(report).toEqual({
      service: 'auth-service',
      category: 'AUTH',
      action: AuthAuditEvent.PASSWORD_CHANGED,
      outcome: 'SUCCESS',
      summary: 'Contraseña cambiada correctamente',
      actor: {
        type: 'USER',
        id: 'user-4',
      },
      context: {
        ip: '192.168.1.1',
        country: 'CO',
      },
      metadata: undefined,
      reason: undefined,
    });
  });

  it('debe construir reporte de cambio de contraseña fallido', () => {
    const report = AuthActivityReportFactory.passwordChangeFailed({
      userId: 'user-5',
      reason: 'INVALID_CURRENT_PASSWORD',
      ip: '10.0.0.1',
    });

    expect(report).toEqual({
      service: 'auth-service',
      category: 'AUTH',
      action: AuthAuditEvent.PASSWORD_CHANGE_FAILED,
      outcome: 'FAILURE',
      summary: 'Cambio de contraseña fallido',
      actor: {
        type: 'USER',
        id: 'user-5',
      },
      context: {
        ip: '10.0.0.1',
        country: undefined,
      },
      reason: 'INVALID_CURRENT_PASSWORD',
      metadata: undefined,
    });
  });

  it('debe construir reporte de login fallido por email no encontrado', () => {
    const report = AuthActivityReportFactory.loginFailed(
      null,
      'ghost@example.com',
      context,
      'EMAIL_NOT_FOUND',
    );

    expect(report.summary).toBe(
      'Inicio de sesión fallido porque el correo no existe',
    );
    expect(report.actor.type).toBe('ANONYMOUS');
  });

  it('debe usar resumen genérico para razón de fallo desconocida', () => {
    const report = AuthActivityReportFactory.loginFailed(
      'user-1',
      undefined,
      context,
      'SOME_UNKNOWN_REASON',
    );

    expect(report.summary).toBe('Inicio de sesión fallido');
  });

  it('debe usar el resumen correcto para UNTRUSTED_COUNTRY en challenge', () => {
    const report = AuthActivityReportFactory.securityChallengeRequired({
      userId: 'user-6',
      context: { ip: '1.2.3.4' },
      reason: LoginChallengeReason.UNTRUSTED_COUNTRY,
    });

    expect(report.summary).toBe(
      'Intento de acceso desde un país no confiable',
    );
  });

  it('debe usar el resumen genérico para NEW_DEVICE en challenge', () => {
    const report = AuthActivityReportFactory.securityChallengeRequired({
      context: { ip: '1.2.3.4' },
      reason: LoginChallengeReason.NEW_DEVICE,
    });

    expect(report.summary).toBe(
      'Se requiere verificación adicional para iniciar sesión',
    );
    expect(report.actor.type).toBe('ANONYMOUS');
  });

  it('debe construir reporte de error interno con actor anónimo', () => {
    const report = AuthActivityReportFactory.internalServerError({
      action: 'AUTH.INTERNAL_ERROR',
      summary: 'Error inesperado en login',
    });

    expect(report.outcome).toBe('FAILURE');
    expect(report.reason).toBe('INTERNAL_ERROR');
    expect(report.actor.type).toBe('ANONYMOUS');
  });

  it('debe construir reporte de error interno con actor de usuario', () => {
    const report = AuthActivityReportFactory.internalServerError({
      action: 'AUTH.INTERNAL_ERROR',
      summary: 'Error en cambio de contraseña',
      actor: { id: 'user-7' },
      context: { ip: '10.0.0.1' },
    });

    expect(report.actor.type).toBe('USER');
    expect(report.actor.id).toBe('user-7');
  });

  it('debe construir reporte de registro fallido con actor anónimo', () => {
    const report = AuthActivityReportFactory.registerFailed({
      email: 'anon@example.com',
      reason: 'EMAIL_ALREADY_EXISTS',
      ip: '127.0.0.1',
    });

    expect(report.actor.type).toBe('ANONYMOUS');
    expect(report.outcome).toBe('FAILURE');
  });

  it('debe normalizar contexto plano (no LoginContext) en createReport', () => {
    // loginAttempted usa LoginContext, registerFailed usa plain context
    const report = AuthActivityReportFactory.registerFailed({
      userId: 'user-8',
      email: 'plain@example.com',
      reason: 'SOME_REASON',
      ip: '192.168.0.1',
      country: 'MX',
      deviceFingerprint: 'fp-xyz',
    });

    expect(report.context).toEqual({
      ip: '192.168.0.1',
      country: 'MX',
      deviceFingerprint: 'fp-xyz',
    });
  });

  it('debe construir reporte de challenge por dispositivo inseguro', () => {
    const report =
      AuthActivityReportFactory.securityChallengeRequired({
        userId: 'user-3',
        email: 'test@example.com',
        context: {
          ip: '127.0.0.1',
        },
        reason: LoginChallengeReason.UNTRUSTED_DEVICE,
      });

    expect(report).toEqual({
      service: 'auth-service',
      category: 'AUTH',
      action:
        AuthAuditEvent.LOGIN_SECURITY_CHALLENGE_REQUIRED,
      outcome: 'REJECTED',
      summary:
        'Intento de acceso desde un dispositivo no seguro',
      actor: {
        type: 'USER',
        id: 'user-3',
        email: 'test@example.com',
      },
      context: {
        ip: '127.0.0.1',
      },
      reason: LoginChallengeReason.UNTRUSTED_DEVICE,
      metadata: undefined,
    });
  });
});
