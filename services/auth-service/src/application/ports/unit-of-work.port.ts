/**
 * Ejecuta operaciones dentro de una transacción
 */
export interface UnitOfWork {
  execute<T>(work: () => Promise<T>): Promise<T>;
}
