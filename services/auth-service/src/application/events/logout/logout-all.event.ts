/**
 * Evento de dominio emitido cuando un usuario cierra
 * **todas** sus sesiones activas simultáneamente.
 *
 * @remarks
 * Incluye el número de sesiones revocadas para auditoría.
 * Los listeners de auditoría reaccionan a este evento.
 */
export class LogoutAllEvent {
  constructor(
    /** Identificador del usuario que realiza el logout global. */
    public readonly userId: string,
    /** Número de sesiones que fueron revocadas. */
    public readonly revokedCount: number,
    /** Contexto de red de la petición. */
    public readonly context: {
      ip: string;
      country?: string;
    },
  ) {}
}
