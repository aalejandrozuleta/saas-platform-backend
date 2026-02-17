/**
 * Value Object que representa el contexto de un intento de login
 * (información ambiental y de seguridad)
 */
export class LoginContext {
  private constructor(
    readonly ip: string,
    readonly country?: string,
    readonly deviceFingerprint?: string,
  ) {}

  /**
   * Crea un LoginContext validado
   */
  static create(params: {
    ip: string;
    country?: string;
    deviceFingerprint?: string;
  }): LoginContext {
    if (!params.ip) {
      throw new Error('LOGIN_CONTEXT_IP_REQUIRED');
    }

    return new LoginContext(
      params.ip,
      params.country,
      params.deviceFingerprint,
    );
  }

  /**
   * Convierte el contexto en metadata para auditoría
   */
  toAuditMetadata(): Record<string, unknown> {
    return {
      ip: this.ip,
      country: this.country,
      deviceFingerprint: this.deviceFingerprint,
    };
  }
}
