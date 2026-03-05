/**
 * Bus de eventos del dominio.
 *
 * Permite publicar eventos generados dentro del dominio para que
 * diferentes subsistemas reaccionen a ellos (audit logs, métricas, etc.).
 */
export interface DomainEventBus {
  publish(event: unknown): void;
}
