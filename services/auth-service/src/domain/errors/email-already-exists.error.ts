/**
 * Error de dominio cuando el email ya existe
 */
export class EmailAlreadyExistsError extends Error {
  readonly code = 'EMAIL_ALREADY_EXISTS';

  constructor() {
    super('EMAIL_ALREADY_EXISTS');
  }
}
