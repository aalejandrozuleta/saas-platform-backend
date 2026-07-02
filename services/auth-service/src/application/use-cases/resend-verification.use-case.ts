import { randomBytes } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { DOMAIN_EVENT_BUS } from '@domain/token/services.tokens';
import { VerificationEmailRequestedEvent } from '@application/events/user/verification-email-requested.event';
import { EnvService } from '@config/env/env.service';
import { EmailVO } from '@domain/value-objects/email.vo';

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_BUS) private readonly eventBus: DomainEventBus,
    private readonly envService: EnvService,
  ) {}

  async execute(email: string): Promise<void> {
    const emailVO = EmailVO.create(email);
    const user = await this.userRepository.findByEmail(emailVO);

    // Sin usuario → respuesta silenciosa para no revelar existencia de cuentas
    if (!user) return;

    if (user.emailVerified) {
      throw DomainErrorFactory.emailAlreadyVerified();
    }

    const token = randomBytes(32).toString('hex');
    const ttlSeconds = this.envService.get('EMAIL_VERIFICATION_TTL');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const updated = user.requestVerification(token, expiresAt);
    await this.userRepository.update(updated);

    this.eventBus.publish(new VerificationEmailRequestedEvent(email, token));
  }
}
