import { randomBytes } from 'node:crypto';

const RECOVERY_CODE_COUNT = 8;

/**
 * Genera un lote de recovery codes de un solo uso, formato
 * `XXXXXXXX-XXXXXXXX` (hex mayúsculas). Usado tanto al confirmar el setup
 * de 2FA ({@link Verify2faUseCase}) como al regenerar el lote
 * ({@link RegenerateRecoveryCodesUseCase}).
 */
export function generateRecoveryCodes(count: number = RECOVERY_CODE_COUNT): string[] {
  return Array.from(
    { length: count },
    () =>
      randomBytes(4).toString('hex').toUpperCase() +
      '-' +
      randomBytes(4).toString('hex').toUpperCase(),
  );
}
