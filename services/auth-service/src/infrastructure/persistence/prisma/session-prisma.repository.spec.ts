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