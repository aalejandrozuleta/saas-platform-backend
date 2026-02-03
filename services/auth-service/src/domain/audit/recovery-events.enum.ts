/**
 * Eventos relacionados con recuperación de cuenta.
 */
export enum RecoveryAuditEvent {
  RECOVERY_CODE_GENERATED = 'RECOVERY_CODE_GENERATED',
  RECOVERY_CODE_USED = 'RECOVERY_CODE_USED',
  RECOVERY_FAILED = 'RECOVERY_FAILED',
}
