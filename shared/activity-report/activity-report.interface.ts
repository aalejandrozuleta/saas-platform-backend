export type ActivityOutcome =
  | 'INFO'
  | 'SUCCESS'
  | 'FAILURE'
  | 'BLOCKED'
  | 'REJECTED';

export type ActivityActorType =
  | 'USER'
  | 'ANONYMOUS'
  | 'SYSTEM'
  | 'SERVICE';

export interface ActivityActor {
  type: ActivityActorType;
  id?: string | null;
  email?: string;
  name?: string;
}

export interface ActivityContext {
  ip?: string;
  country?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ActivityReport {
  service: string;
  category: string;
  action: string;
  outcome: ActivityOutcome;
  summary: string;
  actor: ActivityActor;
  context?: ActivityContext;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type CreateActivityReport = Omit<ActivityReport, 'createdAt'>;

export interface ActivityReportRepository {
  save(report: ActivityReport): Promise<void>;
}

export interface ActivityReporter {
  log(report: CreateActivityReport): Promise<void>;
}
