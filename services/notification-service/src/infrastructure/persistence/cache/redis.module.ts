import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvService } from '@config/env/env.service';
import { QUEUE_EMAIL, QUEUE_WS } from '@modules/notification/domain/queues.constants';

/**
 * Registra la conexión Redis compartida y las colas BullMQ.
 * Global para que cualquier módulo pueda inyectar las colas sin re-importar.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        connection: {
          host: env.get('REDIS_HOST'),
          port: env.get('REDIS_PORT'),
          password: env.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_WS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
