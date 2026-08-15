/**
 * Evento de dominio emitido cuando una empresa provisiona directamente a
 * un worker (sin que el worker se haya registrado por sí mismo).
 *
 * @remarks
 * Consumido por `NotificationListener`, que envía las credenciales reales
 * (login email fake + contraseña temporal) al `contactEmail` provisto por
 * la empresa — el worker nunca ve `tempPassword` en la respuesta HTTP del
 * `ProvisionWorkerUseCase`, solo llega por este evento.
 */
export class WorkerProvisionedEvent {
  constructor(
    public readonly userId: string,
    public readonly loginEmail: string,
    public readonly tempPassword: string,
    public readonly contactEmail: string,
    public readonly firstName: string,
    public readonly companyName: string,
  ) {}
}
