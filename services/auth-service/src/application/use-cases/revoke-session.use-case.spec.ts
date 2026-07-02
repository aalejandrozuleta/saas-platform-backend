import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type Clock } from '@application/ports/clock.port';
import { LogoutEvent } from '@application/events/logout/logout.event';

import { RevokeSessionUseCase } from './revoke-session.use-case';

describe('RevokeSessionUseCase', () => {
  let useCase: RevokeSessionUseCase;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let sessionCache: jest.Mocked<SessionCache>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let clock: jest.Mocked<Clock>;

  const context = { ip: '127.0.0.1', country: 'CO' };
  const now = new Date('2026-01-01T00:00:00Z');

  beforeEach(() => {
    sessionRepository = {
      sessionBelongsToUser: jest.fn(),
      revokeById: jest.fn(),
    } as any;

    refreshTokenRepository = {
      revokeBySession: jest.fn(),
    } as any;

    sessionCache = {
      revokeSession: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    clock = {
      now: jest.fn().mockReturnValue(now),
    } as any;

    useCase = new RevokeSessionUseCase(
      sessionRepository,
      refreshTokenRepository,
      sessionCache,
      eventBus,
      clock,
    );
  });

  it('debe revocar la sesión, el refresh token y publicar LogoutEvent', async () => {
    sessionRepository.sessionBelongsToUser.mockResolvedValue(true);

    await useCase.execute('user-1', 'session-2', context);

    expect(sessionRepository.sessionBelongsToUser).toHaveBeenCalledWith('session-2', 'user-1');
    expect(sessionRepository.revokeById).toHaveBeenCalledWith('session-2', now);
    expect(refreshTokenRepository.revokeBySession).toHaveBeenCalledWith('session-2');
    expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-2');
    expect(eventBus.publish).toHaveBeenCalledWith(
      new LogoutEvent('user-1', 'session-2', context),
    );
  });

  it('debe lanzar error si la sesión no pertenece al usuario', async () => {
    sessionRepository.sessionBelongsToUser.mockResolvedValue(false);

    await expect(useCase.execute('user-1', 'session-2', context)).rejects.toMatchObject({
      code: 'SESSION_NOT_FOUND',
    });

    expect(sessionRepository.revokeById).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
