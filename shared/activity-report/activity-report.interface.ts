/**
 * Resultado de la actividad registrada: éxito, fallo, bloqueo por una regla
 * de seguridad, rechazo de negocio o simplemente informativo.
 */
export type ActivityOutcome = 'INFO' | 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'REJECTED';

/**
 * Tipo de actor que origina la actividad: un usuario autenticado, un
 * visitante anónimo, el propio sistema o un servicio interno.
 */
export type ActivityActorType = 'USER' | 'ANONYMOUS' | 'SYSTEM' | 'SERVICE';

/**
 * Identifica a quién se le atribuye una actividad dentro del reporte.
 */
export interface ActivityActor {
  type: ActivityActorType;
  id?: string | null;
  email?: string;
  name?: string;
}

/**
 * Datos de contexto de la request en la que ocurrió la actividad, útiles
 * para auditoría e investigación de incidentes (IP, país, device fingerprint,
 * user agent, id de correlación de la request).
 */
export interface ActivityContext {
  ip?: string;
  country?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Registro de actividad/auditoría persistido para un servicio. Representa
 * un evento de negocio o de seguridad (login, cambio de datos, acceso
 * bloqueado, etc.) junto con el actor y el contexto en el que ocurrió.
 */
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

/**
 * Payload que reciben los servicios consumidores para registrar una
 * actividad. Omite `createdAt` porque esa marca de tiempo la asigna el
 * propio subsistema en el momento de guardar el reporte.
 */
export type CreateActivityReport = Omit<ActivityReport, 'createdAt'>;

/**
 * Contrato de persistencia para reportes de actividad. Permite
 * intercambiar la implementación de almacenamiento (por ejemplo, Mongo)
 * sin afectar a los consumidores del subsistema.
 */
export interface ActivityReportRepository {
  save(report: ActivityReport): Promise<void>;
}

/**
 * Contrato público que usan los servicios consumidores para emitir
 * actividad de auditoría, sin depender de la implementación concreta del
 * repositorio.
 */
export interface ActivityReporter {
  log(report: CreateActivityReport): Promise<void>;
}
