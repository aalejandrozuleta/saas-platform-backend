import { ErrorCode } from "./ErrorCode.enum";

/**
 * Excepción base para toda la plataforma.
 * No depende de NestJS.
 */
export abstract class BaseException extends Error {
  public readonly code: ErrorCode;
  public readonly metadata?: Record<string, unknown>;
  public readonly httpStatus: number;
  public readonly messageKey: string;

  protected constructor(
    messageKey: string,
    code: ErrorCode,
    httpStatus: number,
    metadata?: Record<string, unknown>,
  ) {
    super(messageKey); 
    this.messageKey = messageKey;
    this.code = code;
    this.httpStatus = httpStatus;
    this.metadata = metadata;
  }
}
