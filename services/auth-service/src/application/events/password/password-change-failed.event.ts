/**
 * Evento de dominio emitido cuando un intento de cambio de contraseña
 * falla (contraseña actual incorrecta, política de contraseña no
 * cumplida, etc.)
 *
 * @remarks
 * `PasswordChangeListener` consume este evento para registrar
 * auditoría del intento fallido, incluyendo el `reason` del fallo.
 */
export class PasswordChangeFailedEvent {
  constructor(
    public readonly userId: string,
    public readonly reason: string,
    public readonly context: {
      ip: string;
      country?: string;
    },
  ) {}
}
