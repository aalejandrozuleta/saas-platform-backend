import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';
import type { Request } from 'express';
import { BaseException, GlobalExceptionFilter, ErrorCode, I18nService } from '@saas/shared';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { LoginAuditService } from '@application/audit/login-audit.service';
import { LoginChallengeReason } from '@application/security/login-challenge.types';
import { AuthAuditEvent } from '@application/audit/auth-events.enum';

/**
 * Filtro de excepciones global de auth-service.
 *
 * @remarks
 * Extiende el `GlobalExceptionFilter` compartido (que ya normaliza la
 * respuesta HTTP a un shape uniforme `{ code, message, ... }` traducido vía
 * i18n) agregándole un efecto secundario propio del dominio de auth:
 * registrar auditoría de seguridad para ciertas excepciones antes de
 * responder al cliente.
 *
 * Centralizar esto acá (en vez de auditar dentro de cada use case) evita
 * duplicar la lógica de auditoría en cada controlador/guard y garantiza que
 * *ningún* error de login o error interno se escape sin dejar rastro, incluso
 * si un desarrollador olvida instrumentar un nuevo endpoint. La captura de
 * auditoría corre en paralelo (fire-and-forget) y sus fallos se ignoran
 * silenciosamente para que un problema de auditoría (ej. Mongo caído) nunca
 * bloquee ni retrase la respuesta de error al usuario.
 */
@Catch()
export class AuthGlobalExceptionFilter implements ExceptionFilter {
  private readonly baseFilter: GlobalExceptionFilter;

  constructor(
    i18n: I18nService,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
    private readonly loginAuditService: LoginAuditService,
  ) {
    this.baseFilter = new GlobalExceptionFilter(i18n);
  }

  /**
   * Punto de entrada del filtro: dispara la auditoría en paralelo (sin
   * esperarla ni dejar que sus errores afecten la respuesta) y delega el
   * formateo de la respuesta HTTP al filtro base compartido.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    void this.captureActivity(exception, host).catch(() => undefined);
    this.baseFilter.catch(exception, host);
  }

  /**
   * Registra auditoría de seguridad según el tipo de excepción capturada:
   *  - `SECURITY_CHALLENGE_REQUIRED` → se registra como intento de login que
   *    requirió verificación adicional (dispositivo/país no confiable, etc.).
   *  - Otras excepciones de dominio (`BaseException`) u HTTP conocidas
   *    (`HttpException`) → no se auditan acá, ya que representan errores
   *    esperados que ya fueron auditados en el use case correspondiente.
   *  - Cualquier otra excepción no controlada → se audita como error interno
   *    (`INTERNAL_ERROR`), ya que por definición no fue anticipada por
   *    ningún use case.
   */
  private async captureActivity(exception: unknown, host: ArgumentsHost): Promise<void> {
    const request = host.switchToHttp().getRequest<Request>();
    const body = (request.body ?? {}) as Record<string, unknown>;
    const context = {
      ip: this.resolveClientIp(request),
      country: this.readStringHeader(request, 'x-country'),
      deviceFingerprint: this.readStringHeader(request, 'x-device-fingerprint'),
      requestId: this.readStringHeader(request, 'x-correlation-id'),
    };
    const email = typeof body.email === 'string' ? body.email : undefined;

    if (
      exception instanceof BaseException &&
      exception.code === ErrorCode.SECURITY_CHALLENGE_REQUIRED
    ) {
      const metadata = exception.metadata ?? {};

      await this.loginAuditService.securityChallengeRequired({
        userId: typeof metadata.userId === 'string' ? metadata.userId : undefined,
        email: typeof metadata.email === 'string' ? metadata.email : email,
        context,
        reason: (metadata.reason as LoginChallengeReason) ?? LoginChallengeReason.NEW_DEVICE,
        metadata,
      });

      return;
    }

    if (exception instanceof BaseException || exception instanceof HttpException) {
      return;
    }

    await this.auditLogger.log({
      service: 'auth-service',
      category: 'AUTH',
      action: AuthAuditEvent.INTERNAL_ERROR,
      outcome: 'FAILURE',
      summary: 'Error interno del servidor en auth-service',
      actor: {
        type: email ? 'ANONYMOUS' : 'SYSTEM',
        email,
      },
      context,
      reason: 'INTERNAL_ERROR',
      metadata: {
        path: request.originalUrl ?? request.url,
        method: request.method,
        exceptionName: exception instanceof Error ? exception.name : 'UnknownError',
      },
    });
  }

  /**
   * Resuelve la IP real del cliente priorizando `X-Forwarded-For` (primer
   * valor de la cadena, el más cercano al cliente original) por sobre
   * `request.ip`, ya que el servicio suele correr detrás de un proxy/balanceador.
   */
  private resolveClientIp(request: Request): string | undefined {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip;
  }

  /**
   * Lee un header HTTP y lo devuelve solo si es un string (Express puede
   * entregar `string[]` para headers repetidos).
   */
  private readStringHeader(request: Request, key: string): string | undefined {
    const value = request.headers[key.toLowerCase()];

    return typeof value === 'string' ? value : undefined;
  }
}
