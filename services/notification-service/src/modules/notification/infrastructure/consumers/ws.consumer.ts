import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_WS, JOB_WS_BROADCAST, JOB_WS_SEND_TO_USER } from '../../domain/queues.constants';
import { WsNotificationPayload } from '../../domain/events/ws-notification.event';
import { WsNotificationsGateway } from '../channels/ws.gateway';

@Processor(QUEUE_WS)
export class WsConsumer extends WorkerHost {
  private readonly logger = new Logger(WsConsumer.name);

  constructor(private readonly gateway: WsNotificationsGateway) {
    super();
  }

  async process(job: Job<WsNotificationPayload>): Promise<void> {
    const { event, target, data } = job.data;

    if (job.name === JOB_WS_BROADCAST) {
      this.gateway.broadcast(event, data);
      this.logger.log(`Broadcast [${event}] enviado`);
      return;
    }

    if (job.name === JOB_WS_SEND_TO_USER) {
      if (typeof target !== 'object' || !target.userId) {
        throw new Error(`Job ${job.id}: target.userId requerido para ws.send-to-user`);
      }
      this.gateway.sendToUser(target.userId, event, data);
      this.logger.log(`WS [${event}] enviado a userId=${target.userId}`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job WS ${job.id} falló: ${error.message}`);
  }
}
