import { type PrismaService } from './prisma.service';
import { PermissionPrismaRepository } from './permission.prisma.repository';

describe('PermissionPrismaRepository', () => {
  let repo: PermissionPrismaRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      rolePermission:  { findMany: jest.fn() },
      userPermission:  { findMany: jest.fn() },
    } as any;

    repo = new PermissionPrismaRepository(prisma);
  });

  describe('findCodesByRole', () => {
    it('debe devolver los códigos de permisos para un rol', async () => {
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([
        { permissionCode: 'invoice:create' },
        { permissionCode: 'invoice:list' },
      ]);

      const codes = await repo.findCodesByRole('EMPLOYEE');

      expect(codes).toEqual(['invoice:create', 'invoice:list']);
      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where:  { role: 'EMPLOYEE' },
        select: { permissionCode: true },
      });
    });

    it('debe devolver array vacío si el rol no tiene permisos', async () => {
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);

      const codes = await repo.findCodesByRole('UNKNOWN');

      expect(codes).toEqual([]);
    });
  });

  describe('findUserOverrides', () => {
    it('debe devolver los overrides del usuario', async () => {
      const overrides = [
        { permissionCode: 'finance:read', granted: true },
        { permissionCode: 'invoice:delete', granted: false },
      ];
      (prisma.userPermission.findMany as jest.Mock).mockResolvedValue(overrides);

      const result = await repo.findUserOverrides('user-1');

      expect(result).toEqual(overrides);
      expect(prisma.userPermission.findMany).toHaveBeenCalledWith({
        where:  { userId: 'user-1' },
        select: { permissionCode: true, granted: true },
      });
    });

    it('debe devolver array vacío si no hay overrides', async () => {
      (prisma.userPermission.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repo.findUserOverrides('user-2');

      expect(result).toEqual([]);
    });
  });
});
