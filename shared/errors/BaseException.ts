import { ErrorCode } from "./ErrorCode.enum";

/**
 * Excepción base para toda la plataforma.
 */
export abstract class BaseException extends Error {
  public readonly code: ErrorCode;
  public readonly metadata?: Record<string, unknown>;

  protected constructor(
    message: string,
    code: ErrorCode,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.metadata = metadata;
  }
}
