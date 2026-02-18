/**
 * Reloj del sistema para evitar dependencia directa de Date.
 */
export interface Clock {
  now(): Date;
}
