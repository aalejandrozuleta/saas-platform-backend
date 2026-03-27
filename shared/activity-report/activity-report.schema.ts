import {
  Prop,
  Schema,
  SchemaFactory,
  raw,
} from '@nestjs/mongoose';
import { Document } from 'mongoose';

import type {
  ActivityActor,
  ActivityContext,
  ActivityOutcome,
} from './activity-report.interface';

export const DEFAULT_ACTIVITY_REPORT_COLLECTION =
  'user_activity_reports';
const ACTIVITY_OUTCOMES = [
  'INFO',
  'SUCCESS',
  'FAILURE',
  'BLOCKED',
  'REJECTED',
] as const;

@Schema({
  versionKey: false,
  timestamps: false,
})
export class ActivityReportDocument extends Document {
  @Prop({ required: true, index: true })
  service!: string;

  @Prop({ required: true, index: true })
  category!: string;

  @Prop({ required: true, index: true })
  action!: string;

  @Prop({
    required: true,
    index: true,
    type: String,
    enum: ACTIVITY_OUTCOMES,
  })
  outcome!: ActivityOutcome;

  @Prop({ required: true })
  summary!: string;

  @Prop(
    raw({
      type: { type: String, required: true },
      id: { type: String, required: false },
      email: { type: String, required: false },
      name: { type: String, required: false },
    }),
  )
  actor!: ActivityActor;

  @Prop(
    raw({
      ip: { type: String, required: false },
      country: { type: String, required: false },
      deviceFingerprint: { type: String, required: false },
      userAgent: { type: String, required: false },
      requestId: { type: String, required: false },
    }),
  )
  context?: ActivityContext;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ required: true, index: true })
  createdAt!: Date;
}

const baseActivityReportSchema =
  SchemaFactory.createForClass(ActivityReportDocument);

baseActivityReportSchema.index({
  service: 1,
  createdAt: -1,
});
baseActivityReportSchema.index({
  'actor.id': 1,
  createdAt: -1,
});
baseActivityReportSchema.index({
  category: 1,
  action: 1,
  createdAt: -1,
});
baseActivityReportSchema.index({
  outcome: 1,
  createdAt: -1,
});

export const createActivityReportSchema = (
  collection: string = DEFAULT_ACTIVITY_REPORT_COLLECTION,
) => {
  const schema = baseActivityReportSchema.clone();

  schema.set('collection', collection);

  return schema;
};
