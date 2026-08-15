/**
 * Estado del vínculo entre un usuario y una empresa.
 *
 * - `INVITED`: invitado, todavía no aceptó.
 * - `ACTIVE`: miembro activo.
 * - `SUSPENDED`: acceso revocado temporalmente sin borrar la membresía.
 */
export enum MembershipStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}
