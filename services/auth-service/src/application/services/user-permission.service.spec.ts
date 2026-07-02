import { type PermissionRepository } from '@application/ports/permission.repository';

import { UserPermissionService } from './user-permission.service';

describe('UserPermissionService', () => {
  let service: UserPermissionService;
  let repo: jest.Mocked<PermissionRepository>;

  beforeEach(() => {
    repo = {
      findCodesByRole: jest.fn(),
      findUserOverrides: jest.fn(),
    };

    // Inject manually since we test outside NestJS DI
    service = new (UserPermissionService as any)();
    (service as any).permissionRepo = repo;
  });

  it('debe devolver permisos del rol cuando no hay overrides', async () => {
    repo.findCodesByRole.mockResolvedValue(['invoice:create', 'invoice:list']);
    repo.findUserOverrides.mockResolvedValue([]);

    const result = await service.getEffectivePermissions('user-1', 'EMPLOYEE');

    expect(result).toEqual(expect.arrayContaining(['invoice:create', 'invoice:list']));
    expect(result).toHaveLength(2);
  });

  it('debe añadir permisos extra concedidos por override (granted=true)', async () => {
    repo.findCodesByRole.mockResolvedValue(['invoice:create']);
    repo.findUserOverrides.mockResolvedValue([{ permissionCode: 'finance:read', granted: true }]);

    const result = await service.getEffectivePermissions('user-1', 'EMPLOYEE');

    expect(result).toContain('invoice:create');
    expect(result).toContain('finance:read');
  });

  it('debe quitar permisos revocados por override (granted=false)', async () => {
    repo.findCodesByRole.mockResolvedValue(['invoice:create', 'invoice:delete']);
    repo.findUserOverrides.mockResolvedValue([
      { permissionCode: 'invoice:delete', granted: false },
    ]);

    const result = await service.getEffectivePermissions('user-1', 'EMPLOYEE');

    expect(result).toContain('invoice:create');
    expect(result).not.toContain('invoice:delete');
  });

  it('debe combinar adds y removes simultáneos', async () => {
    repo.findCodesByRole.mockResolvedValue(['invoice:create', 'invoice:delete']);
    repo.findUserOverrides.mockResolvedValue([
      { permissionCode: 'invoice:delete', granted: false },
      { permissionCode: 'finance:read', granted: true },
    ]);

    const result = await service.getEffectivePermissions('user-1', 'EMPLOYEE');

    expect(result).toContain('invoice:create');
    expect(result).toContain('finance:read');
    expect(result).not.toContain('invoice:delete');
  });

  it('debe devolver array vacío si el rol no tiene permisos y no hay overrides', async () => {
    repo.findCodesByRole.mockResolvedValue([]);
    repo.findUserOverrides.mockResolvedValue([]);

    const result = await service.getEffectivePermissions('user-1', 'UNKNOWN');

    expect(result).toEqual([]);
  });
});
