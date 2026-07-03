import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Módulo de conexión a MongoDB (usado para auditoría/activity reports).
 *
 * @remarks
 * Configura `MongooseModule` de forma asíncrona para leer `MONGO_URL` desde
 * `ConfigService` en vez de un valor estático, permitiendo que la URI de
 * conexión varíe por entorno (local, staging, producción) sin recompilar.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
