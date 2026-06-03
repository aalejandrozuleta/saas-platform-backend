import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type Clock } from '@application/ports/clock.port';
import { LogoutAllEvent } from '@application/events/logout/logout-all.event';

import { LogoutAllUseCase } from './logout-all.use-case';

describe('LogoutAllUseCase', () => {
  let useCase: LogoutAllUseCase;

  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let sessionCache: jest.Mocked<SessionCache>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let clock: jest.Mocked<Clock>;

  const NOW = new Date('2026-01-01T12:00:00.000Z');
  const context = { ip: '192.168.1.1', country: 'MX' };

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

    useCase = new LogoutAllUseCase(
      sessionRepository,
      refreshTokenRepository,
      sessionCache,
      eventBus,
      clock,
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Flujo con sesiones activas
  // ──────────────────────────────────────────────────────────────────────────

  describe('cuando el usuario tiene sesiones activas', () => {
    beforeEach(() => {
      sessionRepository.revokeAllUserSessions.mockResolvedValue([
        'session-1',
        'session-2',
        'session-3',
      ]);
      refreshTokenRepository.revokeAllByUser.mockResolvedValue();
      sessionCache.revokeSession.mockResolvedValue();
    });

    it('debe revocar todas las sesiones en DB con la marca de tiempo correcta', async () => {
      await useCase.execute('user-1', context);

      expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledWith(
        'user-1',
        NOW,
      );
    });

    it('debe revocar todos los refresh tokens del usuario', async () => {
      await useCase.execute('user-1', context);

      expect(refreshTokenRepository.revokeAllByUser).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('debe revocar cada sesión del cache Redis en paralelo', async () => {
      await useCase.execute('user-1', context);

      expect(sessionCache.revokeSession).toHaveBeenCalledTimes(3);
      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-1');
      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-2');
      expect(sessionCache.revokeSession).toHaveBeenCalledWith('session-3');
    });

    it('debe retornar el número de sesiones revocadas', async () => {
      const result = await useCase.execute('user-1', context);

      expect(result).toEqual({ revokedCount: 3 });
    });

    it('debe emitir LogoutAllEvent con userId, revokedCount y contexto', async () => {
      await useCase.execute('user-1', context);

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(LogoutAllEvent),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          revokedCount: 3,
          context,
        }),
      );
    });

    it('debe revocar DB y refresh tokens en paralelo', async () => {
      const callOrder: string[] = [];

      sessionRepository.revokeAllUserSessions.mockImplementation(async () => {
        callOrder.push('revokeAllUserSessions');
        return ['s-1'];
      });
      refreshTokenRepository.revokeAllByUser.mockImplementation(async () => {
        callOrder.push('revokeAllByUser');
      });

      await useCase.execute('user-1', context);

      expect(callOrder).toContain('revokeAllUserSessions');
      expect(callOrder).toContain('revokeAllByUser');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Sin sesiones activas
  // ──────────────────────────────────────────────────────────────────────────

  describe('cuando el usuario no tiene sesiones activas', () => {
    beforeEach(() => {
      sessionRepository.revokeAllUserSessions.mockResolvedValue([]);
      refreshTokenRepository.revokeAllByUser.mockResolvedValue();
    });

    it('debe retornar revokedCount = 0', async () => {
      const result = await useCase.execute('user-1', context);

      expect(result).toEqual({ revokedCount: 0 });
    });

    it('no debe llamar a revokeSession en Redis si no hay sesiones', async () => {
      await useCase.execute('user-1', context);

      expect(sessionCache.revokeSession).not.toHaveBeenCalled();
    });

    it('debe emitir LogoutAllEvent con revokedCount = 0', async () => {
      await useCase.execute('user-1', context);

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ revokedCount: 0 }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Manejo de errores
  // ──────────────────────────────────────────────────────────────────────────

  describe('manejo de errores', () => {
    it('no debe emitir el evento si la revocación en DB falla', async () => {
      sessionRepository.revokeAllUserSessions.mockRejectedValue(
        new Error('DB error'),
      );
      refreshTokenRepository.revokeAllByUser.mockResolvedValue();

      await expect(
        useCase.execute('user-1', context),
      ).rejects.toThrow('DB error');

      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
});
