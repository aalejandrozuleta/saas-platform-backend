jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(() => ({})),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor(_opts: unknown) {}
  },
}));

import { PrismaService } from './prisma.service';

const mockEnv = { get: jest.fn().mockReturnValue('postgresql://test:pass@localhost/db') };

describe('PrismaService', () => {
  it('calls $connect on module init', async () => {
    const svc = new PrismaService(mockEnv as any);
    (svc as any).$connect = jest.fn().mockResolvedValue(undefined);
    await svc.onModuleInit();
    expect((svc as any).$connect).toHaveBeenCalled();
  });

  it('calls $disconnect on module destroy', async () => {
    const svc = new PrismaService(mockEnv as any);
    (svc as any).$disconnect = jest.fn().mockResolvedValue(undefined);
    await svc.onModuleDestroy();
    expect((svc as any).$disconnect).toHaveBeenCalled();
  });
});
