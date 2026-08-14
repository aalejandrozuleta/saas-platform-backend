import { type PrismaService } from './prisma.service';
import { RecoveryCodePrismaRepository } from './recovery-code.prisma.repository';

describe('RecoveryCodePrismaRepository', () => {
  let repository: RecoveryCodePrismaRepository;

  const prismaMock = {
    recoveryCode: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    repository = new RecoveryCodePrismaRepository(prismaMock as unknown as PrismaService);
    jest.clearAllMocks();
  });

  describe('createMany', () => {
    it('debe insertar los hashes de los códigos con el userId', async () => {
      prismaMock.recoveryCode.createMany.mockResolvedValue({ count: 2 });

      await repository.createMany('user-1', ['hash-1', 'hash-2']);

      expect(prismaMock.recoveryCode.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 'user-1', codeHash: 'hash-1' },
          { userId: 'user-1', codeHash: 'hash-2' },
        ],
      });
    });
  });

  describe('deleteAllByUser', () => {
    it('debe eliminar todos los códigos del usuario', async () => {
      prismaMock.recoveryCode.deleteMany.mockResolvedValue({ count: 8 });

      await repository.deleteAllByUser('user-1');

      expect(prismaMock.recoveryCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('findUnusedByUser', () => {
    it('debe devolver los códigos sin usar del usuario', async () => {
      const codes = [{ id: 'code-1', codeHash: 'hash-1' }];
      prismaMock.recoveryCode.findMany.mockResolvedValue(codes);

      const result = await repository.findUnusedByUser('user-1');

      expect(prismaMock.recoveryCode.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', usedAt: null },
        select: { id: true, codeHash: true },
      });
      expect(result).toBe(codes);
    });
  });

  describe('markUsed', () => {
    it('debe marcar el código como usado', async () => {
      prismaMock.recoveryCode.update.mockResolvedValue({});

      await repository.markUsed('code-1');

      expect(prismaMock.recoveryCode.update).toHaveBeenCalledWith({
        where: { id: 'code-1' },
        data: { usedAt: expect.any(Date) },
      });
    });
  });
});
