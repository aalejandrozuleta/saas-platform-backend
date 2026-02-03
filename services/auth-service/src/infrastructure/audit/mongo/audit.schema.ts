import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Documento Mongo para auditoría de seguridad.
 * 
 * Mongoose inicializa las propiedades en runtime,
 * por eso se usa `!` para TypeScript estricto.
 */
@Schema({
  collection: 'security_events',
  timestamps: true,
})
export class AuditEventDocument extends Document {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  event!: string;

  @Prop({ required: true })
  ip!: string;

  @Prop()
  country?: string;

  @Prop()
  deviceFingerprint?: string;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const AuditEventSchema =
  SchemaFactory.createForClass(AuditEventDocument);

/* ───────────────────────────────
   Índices compuestos (CRÍTICO)
   ─────────────────────────────── */

// Timeline de auditoría por usuario
AuditEventSchema.index({ userId: 1, createdAt: -1 });

// Dashboards / alertas por tipo de evento
AuditEventSchema.index({ category: 1, event: 1, createdAt: -1 });

// Consultas globales recientes
AuditEventSchema.index({ createdAt: -1 });

/* ───────────────────────────────
   TTL opcional (retención)
   ─────────────────────────────── */

// política de retención
AuditEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 } // 1 año
);
