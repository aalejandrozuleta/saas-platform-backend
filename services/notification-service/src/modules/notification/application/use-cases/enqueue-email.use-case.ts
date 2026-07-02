import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EnvService } from '@config/env/env.service';

import { QUEUE_EMAIL, JOB_EMAIL_SEND } from '../../domain/queues.constants';
import { EmailNotificationPayload } from '../../domain/events/email-notification.event';

@Injectable()
export class EnqueueEmailUseCase {
  constructor(
    @InjectQueue(QUEUE_EMAIL) private readonly queue: Queue,
    private readonly env: EnvService,
  ) {}

  async execute(payload: EmailNotificationPayload): Promise<void> {
    await this.queue.add(JOB_EMAIL_SEND, payload, {
      attempts: this.env.get('EMAIL_QUEUE_ATTEMPTS'),
      backoff: {
        type: 'exponential',
        delay: this.env.get('EMAIL_QUEUE_BACKOFF_DELAY'),
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    });
  }
}
