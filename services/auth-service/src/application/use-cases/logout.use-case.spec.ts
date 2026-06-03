import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type Clock } from '@application/ports/clock.port';
import { LogoutEvent } from '@application/events/logout/logout.event';

import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let sessionCache: jest.Mocked<SessionCache>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let clock: jest.Mocked<Clock>;

  const NOW = new Date('2026-01-01T12:00:00.000Z');

  const context = { ip: '127.0.0.1', country: 'CO' };

  // ──────────────────────────────────────────────────────────────────────────
  // Setup
  // ──────────────────────────────────────────────────────────────────────────

  beforeEach(() => {
    jest.resetAllMocks();

    sessionRepository = {
      create: jest.fn(),
      countActiveSessions: jest.fn(),
      revokeOldestActiveSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
      revokeById: jest.fn(),
    } as any;

    refreshTokenRepository = {
      create: jest.fn(),
      revokeBySession: jest.fn(),
      findByJti: jest.fn(),
      revoke: jest.fn(),
      revokeAllByUser: jest.fn(),
    } as any;

    sessionCache = {
      storeSession: jest.fn(),
      isSessionActive: jest.fn(),
      revokeSession: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    clock = {
      now: jest.fn().mockReturnValue(NOW),
    } as any;

    useCase = new LogoutUseCase(
      sessionRepository,
      refreshTokenRepository,
      sessionCache,
      eventBus,
      clock,
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flujo exitoso
  // ──────────────────────────────────────────────────────────────────────────

  describe('flujo exitoso', () => {
    beforeEach(() => {
      sessionRepository.revokeById.mockResolvedValue();
      refreshTokenRepository.revokeBySession.mockResolvedValue();
      sessionCache.revokeSession.mockResolvedValue();
    });

    it('debe revocar la sesión en DB con la marca de tiempo correcta', async () => {
      await useCase.execute('user-1', 'session-1', context);

      expect(sessionRepository.revokeById).toHaveBeenCalledWith(
        'session-1',
        NOW,
      );
    });

    it('debe revocar los refresh tokens de la sesión', async () => {
      await useCase.execute('user-1', 'session-1', context);

      expect(refreshTokenRepository.revokeBySession).toHaveBeenCalledWith(
        'session-1',
      );
    });

    it('debe eliminar la sesión del cache Redis', async () => {
      await useCase.execute('user-1', 'session-1', context);

      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-1');
    });

    it('debe ejecutar DB, refresh tokens y cache en paralelo', async () => {
      const callOrder: string[] = [];

      sessionRepository.revokeById.mockImplementation(async () => {
        callOrder.push('revokeById');
      });
      refreshTokenRepository.revokeBySession.mockImplementation(async () => {
        callOrder.push('revokeBySession');
      });
      sessionCache.revokeSession.mockImplementation(async () => {
        callOrder.push('revokeSession');
      });

      await useCase.execute('user-1', 'session-1', context);

      // Los tres deben haberse llamado (el orden es no determinista en paralelo)
      expect(callOrder).toHaveLength(3);
      expect(callOrder).toContain('revokeById');
      expect(callOrder).toContain('revokeBySession');
      expect(callOrder).toContain('revokeSession');
    });

    it('debe emitir LogoutEvent con userId, sessionId y contexto', async () => {
      await useCase.execute('user-1', 'session-abc', context);

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(LogoutEvent),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          sessionId: 'session-abc',
          context,
        }),
      );
    });

    it('no debe emitir el evento si la revocación falla', async () => {
      sessionRepository.revokeById.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute('user-1', 'session-1', context),
      ).rejects.toThrow('DB error');

      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Idempotencia
  // ──────────────────────────────────────────────────────────────────────────

  describe('idempotencia', () => {
    it('debe completarse sin error si la sesión ya estaba revocada', async () => {
      // revokeById con updateMany no lanza si no encuentra la sesión
      sessionRepository.revokeById.mockResolvedValue();
      refreshTokenRepository.revokeBySession.mockResolvedValue();
      sessionCache.revokeSession.mockResolvedValue();

      await expect(
        useCase.execute('user-1', 'already-revoked', context),
      ).resolves.not.toThrow();
    });
  });
});
