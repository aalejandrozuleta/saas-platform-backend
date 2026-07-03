/**
 * Token de inyección de dependencias para el `ActivityReportRepository`
 * concreto (por ejemplo, la implementación de Mongo).
 */
export const ACTIVITY_REPORT_REPOSITORY = Symbol('ACTIVITY_REPORT_REPOSITORY');

/**
 * Token de inyección de dependencias para el `ActivityReporter` público
 * que consumen los servicios para registrar actividad de auditoría.
 */
export const ACTIVITY_REPORTER = Symbol('ACTIVITY_REPORTER');
