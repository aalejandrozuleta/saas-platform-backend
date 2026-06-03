import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ActivityReportMongoRepository } from './activity-report-mongo.repository';
import { ActivityReportService } from './activity-report.service';
import { ACTIVITY_REPORT_REPOSITORY, ACTIVITY_REPORTER } from './activity-report.tokens';
import {
  ActivityReportDocument,
  DEFAULT_ACTIVITY_REPORT_COLLECTION,
  createActivityReportSchema,
} from './activity-report.schema';

export interface ActivityReportMongoModuleOptions {
  collection?: string;
}

@Module({})
export class ActivityReportMongoModule {
  static register(
    options: ActivityReportMongoModuleOptions = {},
  ): DynamicModule {
    const collection =
      options.collection ?? DEFAULT_ACTIVITY_REPORT_COLLECTION;

    return {
      module: ActivityReportMongoModule,
      imports: [
        MongooseModule.forFeature([
          {
            name: ActivityReportDocument.name,
            schema: createActivityReportSchema(collection),
          },
        ]),
      ],
      providers: [
        ActivityReportMongoRepository,
        ActivityReportService,
        {
          provide: ACTIVITY_REPORT_REPOSITORY,
          useExisting: ActivityReportMongoRepository,
        },
        {
          provide: ACTIVITY_REPORTER,
          useExisting: ActivityReportService,
        },
      ],
      exports: [ACTIVITY_REPORT_REPOSITORY, ACTIVITY_REPORTER],
    };
  }
}
