import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import type { Document } from 'mongoose';

/** Documento Mongo de un registro de auditoría de configuración. */
export type ConfigAuditDocument = ConfigAuditLog & Document;

/**
 * Esquema Mongo (Mongoose) para el log de auditoría de config-service.
 * Cada documento registra una acción sobre un recurso de configuración
 * (feature flag, ventana de mantenimiento, etc.), incluyendo el valor
 * anterior y el nuevo para poder reconstruir el historial de cambios.
 *
 * `timestamps: false` porque el propio esquema define su campo `timestamp`.
 */
@Schema({ collection: 'config_audit_logs', timestamps: false })
export class ConfigAuditLog {
  /** Acción realizada, p. ej. `feature_flag.updated`, `maintenance.enabled`. */
  @Prop({ required: true }) action!: string;
  /** Tipo de recurso afectado, p. ej. `feature-flag`, `maintenance-window`. */
  @Prop({ required: true }) resource!: string;
  /** ID del recurso afectado, cuando aplica. */
  @Prop() resourceId?: string;
  /** Valor del recurso antes del cambio (snapshot libre, sin esquema fijo). */
  @Prop({ type: Object }) previousValue?: unknown;
  /** Valor del recurso después del cambio (snapshot libre, sin esquema fijo). */
  @Prop({ type: Object }) newValue?: unknown;
  /** Identificador de quién ejecutó la acción (usuario o servicio). */
  @Prop() performedBy?: string;
  /** Metadatos adicionales de contexto (IP, request ID, etc.). */
  @Prop({ type: Object }) metadata?: Record<string, unknown>;
  /**
   * Momento en que ocurrió la acción. Se excluye de cobertura porque el
   * valor por defecto depende del reloj del sistema en tiempo de ejecución.
   */
  /* istanbul ignore next */
  @Prop({ default: () => new Date() }) timestamp!: Date;
}

export const ConfigAuditLogSchema = SchemaFactory.createForClass(ConfigAuditLog);
