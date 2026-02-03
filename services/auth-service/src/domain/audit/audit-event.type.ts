import { AuditCategory } from './audit-category.enum';
import { AuthAuditEvent } from './auth-events.enum';
import { DeviceAuditEvent } from './device-events.enum';
import { SessionAuditEvent } from './session-events.enum';
import { TokenAuditEvent } from './token-events.enum';
import { TwoFactorAuditEvent } from './twoFactor-events.enum';
import { RecoveryAuditEvent } from './recovery-events.enum';
import { AnomalyAuditEvent } from './anomaly-events.enum';
import { AdminAuditEvent } from './admin-events.enum';

/**
 * Unión de todos los eventos posibles de auditoría.
 */
export type AuditEventName =
  | AuthAuditEvent
  | DeviceAuditEvent
  | SessionAuditEvent
  | TokenAuditEvent
  | TwoFactorAuditEvent
  | RecoveryAuditEvent
  | AnomalyAuditEvent
  | AdminAuditEvent;

/**
 * Evento de auditoría de seguridad.
 */
export type AuditEvent = {
  userId: string;
  category: AuditCategory;
  event: AuditEventName;
  ip: string;
  country?: string;
  deviceFingerprint?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};
