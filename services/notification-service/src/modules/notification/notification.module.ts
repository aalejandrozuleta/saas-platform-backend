import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { QUEUE_EMAIL, QUEUE_WS } from './domain/queues.constants';

import { EnqueueEmailUseCase } from './application/use-cases/enqueue-email.use-case';
import { EnqueueWsUseCase } from './application/use-cases/enqueue-ws.use-case';

import { EmailChannel } from './infrastructure/channels/email.channel';
import { WsNotificationsGateway } from './infrastructure/channels/ws.gateway';
import { EmailConsumer } from './infrastructure/consumers/email.consumer';
import { WsConsumer } from './infrastructure/consumers/ws.consumer';
import { TemplateEngine } from './infrastructure/templates/template.engine';
import { NotificationController } from './infrastructure/controllers/notification.controller';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_WS },
    ),
  ],
  controllers: [NotificationController],
  providers: [
    // Channels
    EmailChannel,
    WsNotificationsGateway,
    // Consumers
    EmailConsumer,
    WsConsumer,
    // Utils
    TemplateEngine,
    // Use cases
    EnqueueEmailUseCase,
    EnqueueWsUseCase,
  ],
})
export class NotificationModule {}
