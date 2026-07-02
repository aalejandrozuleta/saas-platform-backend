import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EnvService } from '@config/env/env.service';

import { QUEUE_WS, JOB_WS_BROADCAST, JOB_WS_SEND_TO_USER } from '../../domain/queues.constants';
import { WsNotificationPayload } from '../../domain/events/ws-notification.event';

@Injectable()
export class EnqueueWsUseCase {
  constructor(
    @InjectQueue(QUEUE_WS) private readonly queue: Queue,
    private readonly env: EnvService,
  ) {}

  async execute(payload: WsNotificationPayload): Promise<void> {
    const jobName = payload.target === 'broadcast' ? JOB_WS_BROADCAST : JOB_WS_SEND_TO_USER;

    await this.queue.add(jobName, payload, {
      attempts: this.env.get('WS_QUEUE_ATTEMPTS'),
      backoff: {
        type: 'exponential',
        delay: this.env.get('WS_QUEUE_BACKOFF_DELAY'),
      },
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 200 },
    });
  }
}
