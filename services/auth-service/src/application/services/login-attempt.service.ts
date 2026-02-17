import { UserBlockedError } from "@domain/errors/user-blocked.error";

/**
 * Servicio de dominio para control de intentos de login
 */
export class LoginAttemptService {
  private readonly MAX_ATTEMPTS = 5;

  /**
   * Valida si el usuario puede intentar login
   */
  canAttempt(failedAttempts: number, blockedUntil?: Date): void {
    if (blockedUntil && blockedUntil > new Date()) {
      throw new UserBlockedError(blockedUntil);
    }

    if (failedAttempts >= this.MAX_ATTEMPTS) {
      throw new UserBlockedError();
    }
  }
}
