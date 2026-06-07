import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import type { Document } from 'mongoose';

export type ConfigAuditDocument = ConfigAuditLog & Document;

@Schema({ collection: 'config_audit_logs', timestamps: false })
export class ConfigAuditLog {
  @Prop({ required: true }) action!: string;
  @Prop({ required: true }) resource!: string;
  @Prop() resourceId?: string;
  @Prop({ type: Object }) previousValue?: unknown;
  @Prop({ type: Object }) newValue?: unknown;
  @Prop() performedBy?: string;
  @Prop({ default: null }) tenantId!: string | null;
  @Prop({ type: Object }) metadata?: Record<string, unknown>;
  @Prop({ default: () => new Date() }) timestamp!: Date;
}

export const ConfigAuditLogSchema = SchemaFactory.createForClass(ConfigAuditLog);
