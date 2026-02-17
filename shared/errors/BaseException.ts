import { ErrorCode } from "./ErrorCode.enum";

/**
 * Excepción base para toda la plataforma.
 * 
 * ❗ No contiene lógica de negocio.
 * ❗ Debe ser extendida por excepciones de dominio en cada microservicio.
 */
export abstract class BaseException extends Error {
  /** Código de error técnico de la plataforma */
  public readonly code: string;

  /** Metadatos adicionales para logging o debugging */
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
