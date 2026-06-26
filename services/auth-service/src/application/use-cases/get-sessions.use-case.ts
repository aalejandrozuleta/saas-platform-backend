import { Inject } from '@nestjs/common';
import { SESSION_REPOSITORY } from '@domain/token/repositories.tokens';
import { SessionRepository } from '@application/ports/session.repository';

export class GetSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(userId: string, currentSessionId: string) {
    const sessions = await this.sessionRepository.findActiveSessions(userId);

    return sessions.map((s) => ({
      id: s.id,
      isCurrent: s.id === currentSessionId,
      ipAddress: s.ipAddress,
      country: s.country,
      startedAt: s.startedAt,
      device: s.device,
    }));
  }
}
