import { Request, Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { BaseException, ErrorCode } from '../errors';



/**
 * Filtro global de excepciones.
 *
 * Responsabilidades:
 * - Traducir errores de dominio (BaseException) a HTTP.
 * - Normalizar errores HttpException de Nest.
 * - Garantizar formato uniforme de respuesta.
 * - Evitar exposición de detalles internos.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    /**
     * 1️⃣ Errores de dominio (BaseException)
     */
    if (exception instanceof BaseException) {
      response.status(exception.httpStatus).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          metadata: exception.metadata ?? null,
        },
        path,
        timestamp,
      });
      return;
    }

    /**
     * 2️⃣ HttpException (errores de Nest o manuales)
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
     * 3️⃣ Fallback inesperado
     */
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      },
      path,
      timestamp,
    });
  }
}
