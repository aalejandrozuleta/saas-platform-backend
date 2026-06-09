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
  @Prop({ type: Object }) metadata?: Record<string, unknown>;
  /* istanbul ignore next */
  @Prop({ default: () => new Date() }) timestamp!: Date;
}

export const ConfigAuditLogSchema = SchemaFactory.createForClass(ConfigAuditLog);
