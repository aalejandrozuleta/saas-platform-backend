import { ErrorCode } from "./ErrorCode.enum";

/**
 * Excepción base para toda la plataforma.
 * No depende de NestJS.
 */
export abstract class BaseException extends Error {
  public readonly code: ErrorCode;
  public readonly metadata?: Record<string, unknown>;
  public readonly httpStatus: number;

  protected constructor(
    message: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.metadata = metadata;
  }
}
