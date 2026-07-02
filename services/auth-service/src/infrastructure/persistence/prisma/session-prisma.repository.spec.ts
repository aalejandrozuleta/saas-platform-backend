import { SessionPrismaRepository } from './session-prisma.repository';
import { type PrismaService } from './prisma.service';

describe('SessionPrismaRepository', () => {
  let repository: SessionPrismaRepository;

  let prisma: any;

  beforeEach(() => {
    prisma = {
      session: {
        create: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new SessionPrismaRepository(
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una nueva sesión', async () => {
      prisma.session.create.mockResolvedValue({ id: 'session-1' });

      const result = await repository.create({
        userId: 'user-1',
        deviceId: 'device-1',
        ipAddress: '127.0.0.1',
        country: 'CO',
      });

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          deviceId: 'device-1',
          ipAddress: '127.0.0.1',
          country: 'CO',
        },
        select: { id: true },
      });

      expect(result).toEqual({ id: 'session-1' });
    });

    it('debe usar cliente transaccional si se proporciona', async () => {
      const tx = {
        session: {
          create: jest.fn().mockResolvedValue({ id: 'session-2' }),
        },
      };

      await repository.create(
        {
          userId: 'user-1',
          ipAddress: '127.0.0.1',
        },
        tx as any,
      );

      expect(tx.session.create).toHaveBeenCalled();
    });
  });

  describe('countActiveSessions', () => {
    it('debe contar sesiones activas', async () => {
      prisma.session.count.mockResolvedValue(3);

      const result = await repository.countActiveSessions('user-1');

      expect(prisma.session.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          revokedAt: null,
          endedAt: null,
        },
      });

      expect(result).toBe(3);
    });

    it('debe usar cliente transaccional', async () => {
      const tx = {
        session: {
          count: jest.fn().mockResolvedValue(2),
        },
      };

      await repository.countActiveSessions(
        'user-1',
        tx as any,
      );

      expect(tx.session.count).toHaveBeenCalled();
    });
  });

  describe('revokeById', () => {
    it('debe revocar una sesión específica por su ID', async () => {
      const now = new Date();
      prisma.session.updateMany = jest.fn().mockResolvedValue({ count: 1 });

      await repository.revokeById('session-xyz', now);

      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'session-xyz',
          revokedAt: null,
          endedAt: null,
        },
        data: { revokedAt: now },
      });
    });

    it('debe completarse sin error si la sesión ya estaba revocada (idempotente)', async () => {
      prisma.session.updateMany = jest.fn().mockResolvedValue({ count: 0 });

      await expect(
        repository.revokeById('already-revoked', new Date()),
      ).resolves.not.toThrow();
    });
  });

  describe('revokeAllUserSessions', () => {
    it('debe revocar todas las sesiones activas y retornar sus IDs', async () => {
      const now = new Date();

      prisma.session.findMany = jest.fn().mockResolvedValue([
        { id: 'session-1' },
        { id: 'session-2' },
      ]);
      prisma.session.updateMany = jest.fn().mockResolvedValue({ count: 2 });

      const ids = await repository.revokeAllUserSessions('user-1', now);

      expect(prisma.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null, endedAt: null },
        select: { id: true },
      });
      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['session-1', 'session-2'] } },
        data: { revokedAt: now },
      });
      expect(ids).toEqual(['session-1', 'session-2']);
    });

    it('debe retornar array vacío si no hay sesiones activas', async () => {
      prisma.session.findMany = jest.fn().mockResolvedValue([]);
      prisma.session.updateMany = jest.fn();

      const ids = await repository.revokeAllUserSessions('user-1', new Date());

      expect(ids).toEqual([]);
      expect(prisma.session.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('findActiveSessions', () => {
    it('debe listar las sesiones activas mapeando el dispositivo', async () => {
      const startedAt = new Date();
      const lastUsedAt = new Date();
      prisma.session.findMany = jest.fn().mockResolvedValue([
        {
          id: 'session-1',
          ipAddress: '127.0.0.1',
          country: 'CO',
          startedAt,
          device: {
            deviceName: 'iPhone',
            os: 'iOS',
            browser: 'Safari',
            isTrusted: true,
            lastUsedAt,
          },
        },
        {
          id: 'session-2',
          ipAddress: '10.0.0.1',
          country: 'US',
          startedAt,
          device: null,
        },
      ]);

      const result = await repository.findActiveSessions('user-1');

      expect(prisma.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null, endedAt: null },
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          ipAddress: true,
          country: true,
          startedAt: true,
          device: {
            select: {
              deviceName: true,
              os: true,
              browser: true,
              isTrusted: true,
              lastUsedAt: true,
            },
          },
        },
      });

      expect(result).toEqual([
        {
          id: 'session-1',
          ipAddress: '127.0.0.1',
          country: 'CO',
          startedAt,
          device: {
            name: 'iPhone',
            os: 'iOS',
            browser: 'Safari',
            isTrusted: true,
            lastUsedAt,
          },
        },
        {
          id: 'session-2',
          ipAddress: '10.0.0.1',
          country: 'US',
          startedAt,
          device: null,
        },
      ]);
    });
  });

  describe('sessionBelongsToUser', () => {
    it('debe retornar true si la sesión pertenece al usuario y está activa', async () => {
      prisma.session.count.mockResolvedValue(1);

      const result = await repository.sessionBelongsToUser('session-1', 'user-1');

      expect(prisma.session.count).toHaveBeenCalledWith({
        where: { id: 'session-1', userId: 'user-1', revokedAt: null, endedAt: null },
      });
      expect(result).toBe(true);
    });

    it('debe retornar false si la sesión no pertenece al usuario', async () => {
      prisma.session.count.mockResolvedValue(0);

      const result = await repository.sessionBelongsToUser('session-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  describe('revokeOldestActiveSession', () => {
    it('debe revocar la sesión activa más antigua', async () => {
      const now = new Date();

      prisma.session.findFirst.mockResolvedValue({
        id: 'session-old',
      });

      await repository.revokeOldestActiveSession(
        'user-1',
        now,
      );

      expect(prisma.session.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          revokedAt: null,
          endedAt: null,
        },
        orderBy: { startedAt: 'asc' },
        select: { id: true },
      });

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 'session-old' },
        data: { revokedAt: now },
      });
    });

    it('no debe hacer nada si no hay sesiones activas', async () => {
      prisma.session.findFirst.mockResolvedValue(null);

      await repository.revokeOldestActiveSession(
        'user-1',
        new Date(),
      );

      expect(prisma.session.update).not.toHaveBeenCalled();
    });

    it('debe usar cliente transaccional', async () => {
      const tx = {
        session: {
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn(),
        },
      };

      await repository.revokeOldestActiveSession(
        'user-1',
        new Date(),
        tx as any,
      );

      expect(tx.session.findFirst).toHaveBeenCalled();
    });
  });
});