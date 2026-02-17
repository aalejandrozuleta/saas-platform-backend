import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BaseException } from '../errors/BaseException';
import { ErrorCode } from '../errors/ErrorCode.enum';
import { HttpErrorMapper } from '../errors/HttpError.mapper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1️⃣ BaseException
    if (exception instanceof BaseException) {
      const status = HttpErrorMapper[exception.code];

      return response.status(status).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          metadata: exception.metadata ?? null,
        },
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // 2️⃣ Nest HttpException
    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: exception.message,
        },
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // 3️⃣ Fallback
    return response.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
