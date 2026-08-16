/**
 * Rol de un usuario dentro de una empresa.
 *
 * - `OWNER`: dueño del tenant, control total (incluye facturación).
 * - `MANAGER`: puede gestionar miembros y operar la empresa.
 * - `WORKER`: solo opera, no gestiona miembros.
 */
export enum MembershipRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
}
