/**
 * Eventos administrativos o internos.
 */
export enum AdminAuditEvent {
  USER_BLOCKED = 'USER_BLOCKED',
  USER_UNBLOCKED = 'USER_UNBLOCKED',
  FORCE_LOGOUT = 'FORCE_LOGOUT',
  SECURITY_POLICY_UPDATED = 'SECURITY_POLICY_UPDATED',
}
