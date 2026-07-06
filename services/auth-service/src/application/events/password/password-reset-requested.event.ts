/**
 * Evento de dominio emitido cuando un usuario solicita recuperar su
 * contraseña ("olvidé mi contraseña").
 *
 * @remarks
 * Consumido por `NotificationListener`, que envía el correo con el enlace
 * de recuperación. Al igual que `VerificationEmailRequestedEvent`, no
 * incluye contexto de red (ip/country) porque se emite desde un flujo no
 * autenticado.
 */
export class PasswordResetRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly resetToken: string,
  ) {}
}
