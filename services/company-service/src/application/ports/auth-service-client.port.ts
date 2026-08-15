/**
 * Datos mínimos que company-service necesita de un usuario de auth-service.
 */
export interface LookedUpUser {
  readonly userId: string;
  readonly email: string;
}

/**
 * Puerto de salida hacia auth-service.
 *
 * @remarks
 * Permite que los casos de uso resuelvan el `userId` a partir de un email
 * sin conocer el transporte (HTTP, cola, etc.). La implementación vive en
 * `infrastructure/http/auth-service.client.ts`.
 */
export interface AuthServiceClientPort {
  /**
   * Resuelve un usuario por email.
   *
   * @returns el usuario, o `null` si auth-service no lo conoce (404).
   */
  lookupUserByEmail(email: string): Promise<LookedUpUser | null>;

  /**
   * Provisiona un usuario worker nuevo directamente en auth-service.
   *
   * @returns el `userId` creado y el login email generado.
   */
  provisionWorker(input: {
    firstName: string;
    lastName: string;
    contactEmail: string;
    companyName: string;
  }): Promise<{ userId: string; loginEmail: string }>;
}
