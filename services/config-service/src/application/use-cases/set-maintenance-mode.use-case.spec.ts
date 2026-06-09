import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { ConfigCache } from '@application/ports/config-cache.port';

import { SetMaintenanceModeUseCase, MAINTENANCE_SINGLETON_ID } from './set-maintenance-mode.use-case';

function makePrisma(row?: Partial<{ enabled: boolean; message: string | null; readOnly: boolean; updatedAt: Date }>) {
  const defaultRow = { id: MAINTENANCE_SINGLETON_ID, enabled: false, message: null, readOnly: false, updatedAt: new Date(), updatedBy: null };
  const result = { ...defaultRow, ...row };
  return {
    maintenanceConfig: {
      upsert: jest.fn().mockResolvedValue(result),
    },
  } as any;
}

function makeUseCase(prismaRow?: Parameters<typeof makePrisma>[0]) {
  const prisma = makePrisma(prismaRow);
  const cache: ConfigCache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
  };
  const audit: AuditLogger = { log: jest.fn().mockResolvedValue(undefined) };

  return { uc: new SetMaintenanceModeUseCase(prisma, audit, cache), prisma, cache, audit };
}

describe('SetMaintenanceModeUseCase', () => {
  it('returns enabled=true and message from persisted row', async () => {
    const { uc } = makeUseCase({ enabled: true, message: 'Down for maintenance' });
    const result = await uc.execute({ enabled: true, message: 'Down for maintenance' });
    expect(result.enabled).toBe(true);
    expect(result.message).toBe('Down for maintenance');
  });

  it('upserts via PrismaService', async () => {
    const { uc, prisma } = makeUseCase();
    await uc.execute({ enabled: true });
    expect(prisma.maintenanceConfig.upsert).toHaveBeenCalledTimes(1);
  });

  it('invalidates gateway cache after upsert', async () => {
    const { uc, cache } = makeUseCase();
    await uc.execute({ enabled: true });
    expect(cache.del).toHaveBeenCalledWith('gateway:maintenance:status');
  });

  it('logs MAINTENANCE_MODE_ENABLED when enabling', async () => {
    const { uc, audit } = makeUseCase({ enabled: true });
    await uc.execute({ enabled: true });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'MAINTENANCE_MODE_ENABLED' }));
  });

  it('logs MAINTENANCE_MODE_DISABLED when disabling', async () => {
    const { uc, audit } = makeUseCase({ enabled: false });
    await uc.execute({ enabled: false });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'MAINTENANCE_MODE_DISABLED' }));
  });

  it('returns null message when not provided', async () => {
    const { uc } = makeUseCase({ enabled: true, message: null });
    const result = await uc.execute({ enabled: true });
    expect(result.message).toBeNull();
  });

  it('returns updatedAt as a Date', async () => {
    const { uc } = makeUseCase();
    const result = await uc.execute({ enabled: true });
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('passes updatedBy to audit logger', async () => {
    const { uc, audit } = makeUseCase();
    await uc.execute({ enabled: true, updatedBy: 'admin-123' });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ performedBy: 'admin-123' }));
  });
});
