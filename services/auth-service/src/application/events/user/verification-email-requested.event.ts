/**
 * Evento de dominio emitido cuando un usuario solicita el reenvío
 * del correo de verificación de cuenta (por ejemplo, porque el
 * token original expiró o no llegó a su bandeja de entrada).
 *
 * @remarks
 * Consumido por `NotificationListener`, que reenvía el correo de
 * bienvenida ("Activa tu cuenta Arlok") con un nuevo enlace de
 * verificación. A diferencia de `UserRegisteredEvent`, no incluye
 * contexto de red (ip/country) porque no se emite desde un flujo
 * autenticado por sesión.
 */
export class VerificationEmailRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly verificationToken: string,
  ) {}
}
