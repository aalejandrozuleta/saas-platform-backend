import { Request, Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { BaseException, ErrorCode } from '../errors';
import { I18nService } from '../i18n';

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

    const timestamp = new Date().toISOString();
    const path = request.url;

    const acceptLanguage = request.headers['accept-language'];
    const lang =
      typeof acceptLanguage === 'string'
        ? acceptLanguage.split(',')[0]
        : undefined;

    /**
     * 1️⃣ Errores de dominio
     */
    if (exception instanceof BaseException) {
      const translatedMessage = this.i18n.translate(
        exception.messageKey,
        lang,
      );

      response.status(exception.httpStatus).json({
        success: false,
        error: {
          code: exception.code,
          message: translatedMessage,
          metadata: exception.metadata ?? null,
        },
        path,
        timestamp,
      });

      return;
    }

    /**
     * 2️⃣ HttpException
     */
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      response.status(status).json({
        success: false,
        error:
          typeof body === 'object'
            ? body
            : {
                code: ErrorCode.INTERNAL_ERROR,
                message: body,
              },
        path,
        timestamp,
      });

      return;
    }

    /**
     * 3️⃣ Fallback
     */
    const fallbackMessage = this.i18n.translate(
      'common.internal_error',
      lang,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: fallbackMessage,
      },
      path,
      timestamp,
    });
  }
}
