import { AuditCategory } from './audit-category.enum';

export type AuditEvent = {
  userId?: string ;
  category: AuditCategory;
  event: string;
  ip?: string;
  country?: string;
  deviceFingerprint?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};
