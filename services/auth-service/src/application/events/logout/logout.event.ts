/**
 * Evento de dominio emitido cuando un usuario cierra
 * la sesión actual de forma explícita.
 *
 * @remarks
 * Se emite una única vez por sesión revocada.
 * Los listeners de auditoría reaccionan a este evento.
 */
export class LogoutEvent {
  constructor(
    /** Identificador del usuario que realiza el logout. */
    public readonly userId: string,
    /** Identificador de la sesión que se está cerrando. */
    public readonly sessionId: string,
    /** Contexto de red de la petición. */
    public readonly context: {
      ip: string;
      country?: string;
    },
  ) {}
}
