import { LogEvent } from './log-event.interface';

/**
 * Eventos comunes de autenticación.
 * 
 * Estos eventos se usan SOLO para métricas y análisis.
 */
export const AuthLogEvents = {
  loginSuccess: (userId: string): LogEvent => ({
    eventName: 'auth.login.success',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    metadata: { userId }
  }),

  loginFailed: (reason: string): LogEvent => ({
    eventName: 'auth.login.failed',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    metadata: { reason }
  })
};
