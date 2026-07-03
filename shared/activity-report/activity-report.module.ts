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

/**
 * Opciones de configuración para `ActivityReportMongoModule.register`.
 */
export interface ActivityReportMongoModuleOptions {
  collection?: string;
}

/**
 * Módulo dinámico que expone el subsistema de reportes de actividad
 * (auditoría) respaldado por MongoDB. Registra el repositorio Mongo y el
 * servicio de logging detrás de los tokens `ACTIVITY_REPORT_REPOSITORY` y
 * `ACTIVITY_REPORTER`, para que cada microservicio pueda inyectar
 * `ActivityReporter` sin acoplarse a Mongoose directamente.
 */
@Module({})
export class ActivityReportMongoModule {
  /**
   * Registra el módulo de forma síncrona.
   *
   * @param options - Opciones de configuración; permite indicar el nombre
   *   de la colección de Mongo a usar (por defecto
   *   `DEFAULT_ACTIVITY_REPORT_COLLECTION`).
   * @returns El `DynamicModule` a importar en el módulo raíz del servicio.
   */
  static register(options: ActivityReportMongoModuleOptions = {}): DynamicModule {
    const collection = options.collection ?? DEFAULT_ACTIVITY_REPORT_COLLECTION;

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
