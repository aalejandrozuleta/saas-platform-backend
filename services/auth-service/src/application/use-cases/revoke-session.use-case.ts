import { Inject } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { SESSION_CACHE, DOMAIN_EVENT_BUS } from '@domain/token/services.tokens';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { SessionCache } from '@application/ports/session-cache.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { LogoutEvent } from '@application/events/logout/logout.event';
import { Clock } from '@application/ports/clock.port';

export class RevokeSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,

    @Inject(SESSION_CACHE)
    private readonly sessionCache: SessionCache,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,

    @Inject('CLOCK')
    private readonly clock: Clock,
  ) {}

  async execute(
    userId: string,
    targetSessionId: string,
    context: { ip: string; country?: string },
  ): Promise<void> {
    const belongs = await this.sessionRepository.sessionBelongsToUser(
      targetSessionId,
      userId,
    );

    if (!belongs) {
      throw DomainErrorFactory.sessionNotFound();
    }

    await Promise.all([
      this.sessionRepository.revokeById(targetSessionId, this.clock.now()),
      this.refreshTokenRepository.revokeBySession(targetSessionId),
      this.sessionCache.revokeSession(targetSessionId),
    ]);

    this.eventBus.publish(new LogoutEvent(userId, targetSessionId, context));
  }
}
