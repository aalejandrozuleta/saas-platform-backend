/**
 * Evento de dominio emitido cuando un nuevo usuario completa el
 * registro en la plataforma.
 *
 * @remarks
 * Consumido por `NotificationListener`, que envía el correo de
 * bienvenida ("Activa tu cuenta Arlok") con el enlace de verificación
 * construido a partir de `verificationToken`.
 */
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly context: {
      ip: string;
      country?: string;
    },
    public readonly verificationToken: string,
  ) {}
}
