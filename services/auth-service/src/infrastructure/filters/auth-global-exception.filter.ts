import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import type { Request } from 'express';
import { BaseException, GlobalExceptionFilter, ErrorCode } from '@saas/shared';
import { I18nService } from '@saas/shared';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { LoginAuditService } from '@application/audit/login-audit.service';
import { LoginChallengeReason } from '@application/security/login-challenge.types';
import { AuthAuditEvent } from '@application/audit/auth-events.enum';

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

  catch(exception: unknown, host: ArgumentsHost): void {
    void this.captureActivity(exception, host).catch(() => undefined);
    this.baseFilter.catch(exception, host);
  }

  private async captureActivity(
    exception: unknown,
    host: ArgumentsHost,
  ): Promise<void> {
    const request = host.switchToHttp().getRequest<Request>();
    const body = (request.body ?? {}) as Record<string, unknown>;
    const context = {
      ip: this.resolveClientIp(request),
      country: this.readStringHeader(request, 'x-country'),
      deviceFingerprint: this.readStringHeader(
        request,
        'x-device-fingerprint',
      ),
      requestId: this.readStringHeader(
        request,
        'x-correlation-id',
      ),
    };
    const email =
      typeof body.email === 'string' ? body.email : undefined;

    if (
      exception instanceof BaseException &&
      exception.code === ErrorCode.SECURITY_CHALLENGE_REQUIRED
    ) {
      const metadata = (exception.metadata ??
        {}) as Record<string, unknown>;

      await this.loginAuditService.securityChallengeRequired({
        userId:
          typeof metadata.userId === 'string'
            ? metadata.userId
            : undefined,
        email:
          typeof metadata.email === 'string'
            ? metadata.email
            : email,
        context,
        reason: (metadata.reason as LoginChallengeReason) ??
          LoginChallengeReason.NEW_DEVICE,
        metadata,
      });

      return;
    }

    if (
      exception instanceof BaseException ||
      exception instanceof HttpException
    ) {
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
        exceptionName:
          exception instanceof Error
            ? exception.name
            : 'UnknownError',
      },
    });
  }

  private resolveClientIp(request: Request): string | undefined {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip;
  }

  private readStringHeader(
    request: Request,
    key: string,
  ): string | undefined {
    const value = request.headers[key.toLowerCase()];

    return typeof value === 'string' ? value : undefined;
  }
}
