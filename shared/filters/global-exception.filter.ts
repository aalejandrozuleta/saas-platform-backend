import { Request, Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  BaseException,
  ErrorCode,
  getErrorCodeFromHttpStatus,
} from '../errors';
import { I18nService } from '../i18n';
import {
  buildResponseMeta,
  errorResponse,
  isApiErrorResponse,
} from '../response';

/**
 * Filtro global de excepciones con soporte i18n.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly i18n: I18nService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const acceptLanguage = this.getRequestedLanguage(request);
    const resolvedLang = this.i18n.resolveLanguage(acceptLanguage);

    /**
     * 1️⃣ Errores de dominio
     */
    if (exception instanceof BaseException) {
      const translatedMessage = this.i18n.translate(
        exception.messageKey,
        acceptLanguage,
        exception.metadata,
      );

      response.status(exception.httpStatus).json(
        errorResponse(
          {
            code: exception.code,
            message: translatedMessage,
            metadata: exception.metadata,
          },
          {
            meta: buildResponseMeta(
              request,
              exception.httpStatus,
              resolvedLang,
            ),
          },
        ),
      );

      return;
    }

    /**
     * 2️⃣ HttpException
     */
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (isApiErrorResponse(body)) {
        response.status(status).json(
          errorResponse(body.error, {
            meta: buildResponseMeta(request, status, resolvedLang),
          }),
        );

        return;
      }

      response.status(status).json(
        errorResponse(
          this.normalizeHttpException(body, status, acceptLanguage),
          {
            meta: buildResponseMeta(request, status, resolvedLang),
          },
        ),
      );

      return;
    }

    /**
     * 3️⃣ Fallback
     */
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      errorResponse(
        {
          code: ErrorCode.INTERNAL_ERROR,
          message: this.i18n.translate(
            'common.internal_error',
            acceptLanguage,
          ),
        },
        {
          meta: buildResponseMeta(
            request,
            HttpStatus.INTERNAL_SERVER_ERROR,
            resolvedLang,
          ),
        },
      ),
    );
  }

  private normalizeHttpException(
    body: unknown,
    status: number,
    lang?: string,
  ): {
    code: ErrorCode | string;
    message: string;
    details?: unknown;
    metadata?: Record<string, unknown>;
  } {
    if (typeof body === 'string') {
      return {
        code: getErrorCodeFromHttpStatus(status),
        message: body,
      };
    }

    if (!body || typeof body !== 'object') {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: this.i18n.translate('common.internal_error', lang),
      };
    }

    const record = body as Record<string, unknown>;
    const rawMessage = record.message;
    const metadata = this.asMetadata(record.metadata);

    if (typeof record.messageKey === 'string') {
      return {
        code:
          typeof record.code === 'string'
            ? record.code
            : getErrorCodeFromHttpStatus(status),
        message: this.i18n.translate(record.messageKey, lang, metadata),
        details: record.details,
        metadata,
      };
    }

    if (Array.isArray(rawMessage)) {
      return {
        code:
          typeof record.code === 'string'
            ? record.code
            : getErrorCodeFromHttpStatus(status),
        message: this.i18n.translate('common.validation_error', lang),
        details: rawMessage,
        metadata,
      };
    }

    return {
      code:
        typeof record.code === 'string'
          ? record.code
          : getErrorCodeFromHttpStatus(status),
      message:
        typeof rawMessage === 'string'
          ? rawMessage
          : typeof record.error === 'string'
            ? record.error
            : this.i18n.translate('common.internal_error', lang),
      details: record.details,
      metadata,
    };
  }

  private getRequestedLanguage(request: Request): string | undefined {
    const acceptLanguage = request.headers['accept-language'];

    return typeof acceptLanguage === 'string' ? acceptLanguage : undefined;
  }

  private asMetadata(
    value: unknown,
  ): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return value as Record<string, unknown>;
  }
}
