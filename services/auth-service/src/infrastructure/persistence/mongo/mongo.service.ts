import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuditCategory } from '@domain/audit/audit-category.enum';

/**
 * Documento Mongo para eventos de auditoría
 */
@Schema({
  collection: 'audit_events',
  timestamps: false,
})
export class AuditEventDocument extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({
    required: true,
    enum: Object.values(AuditCategory),
  })
  category!: AuditCategory;

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

  @Prop({ required: true })
  createdAt!: Date;
}

export const AuditEventSchema =
  SchemaFactory.createForClass(AuditEventDocument);
