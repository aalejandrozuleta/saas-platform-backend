/**
 * @remarks
 * Punto de entrada del subsistema de reportes de actividad (auditoría):
 * agrupa el contrato (`ActivityReporter`/`ActivityReportRepository`), el
 * módulo dinámico de Mongo, la implementación del repositorio, el schema
 * de Mongoose, el servicio de logging y los tokens de inyección.
 */
export * from './activity-report.interface';
export * from './activity-report.module';
export * from './activity-report-mongo.repository';
export * from './activity-report.schema';
export * from './activity-report.service';
export * from './activity-report.tokens';
