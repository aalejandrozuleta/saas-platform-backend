import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvModule } from '@config/env/env.module';
import { EnvService } from '@config/env/env.service';

/**
 * Módulo de conexión a MongoDB (auditoría).
 */
@Module({
  imports: [
    EnvModule,
    MongooseModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        uri: env.get('MONGO_URL'),
      }),
    }),
  ],
})
export class MongoModule {}
