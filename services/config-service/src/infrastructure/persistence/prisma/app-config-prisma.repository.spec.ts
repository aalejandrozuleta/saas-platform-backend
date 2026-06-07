import { AppConfigPrismaRepository } from './app-config-prisma.repository';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';

function makeRow(override: Partial<object> = {}) {
  return {
    id: 'id-1',
    key: 'maintenance.enabled',
    value: 'true',
    description: null,
    category: 'MAINTENANCE',
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makePrisma(overrides: Record<string, unknown> = {}) {
  return {
    appConfig: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue(makeRow()),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      ...overrides,
    },
  } as any;
}

function makeEntity(): AppConfig {
  return new AppConfig({
    id: 'id-1',
    key: 'maintenance.enabled',
    value: 'true',
    category: ConfigCategory.MAINTENANCE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('AppConfigPrismaRepository', () => {
  it('findByKey returns null when not found', async () => {
    const repo = new AppConfigPrismaRepository(makePrisma());
    const result = await repo.findByKey('missing.key');
    expect(result).toBeNull();
  });

  it('findByKey returns AppConfig when found', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(makeRow()) });
    const repo = new AppConfigPrismaRepository(prisma);
    const result = await repo.findByKey('maintenance.enabled');
    expect(result).toBeInstanceOf(AppConfig);
    expect(result?.key).toBe('maintenance.enabled');
  });

  it('findAll returns empty array when no records', async () => {
    const repo = new AppConfigPrismaRepository(makePrisma());
    const result = await repo.findAll();
    expect(result).toHaveLength(0);
  });

  it('findAll maps rows to AppConfig entities', async () => {
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue([makeRow(), makeRow({ key: 'x', id: 'id-2' })]) });
    const repo = new AppConfigPrismaRepository(prisma);
    const result = await repo.findAll();
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(AppConfig);
  });

  it('save calls upsert and returns entity', async () => {
    const repo = new AppConfigPrismaRepository(makePrisma());
    const saved = await repo.save(makeEntity());
    expect(saved).toBeInstanceOf(AppConfig);
  });

  it('delete calls deleteMany with key filter', async () => {
    const prisma = makePrisma();
    const repo = new AppConfigPrismaRepository(prisma);
    await repo.delete('maintenance.enabled');
    expect(prisma.appConfig.deleteMany).toHaveBeenCalledWith({ where: { key: 'maintenance.enabled' } });
  });
});
