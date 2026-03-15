import { LoginContext } from '@domain/value-objects/login-context.vo';

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
});
