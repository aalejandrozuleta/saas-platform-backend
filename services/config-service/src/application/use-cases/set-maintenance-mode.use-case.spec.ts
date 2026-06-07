import { randomUUID } from 'node:crypto';
import { SetMaintenanceModeUseCase, MAINTENANCE_KEY, MAINTENANCE_MESSAGE_KEY } from './set-maintenance-mode.use-case';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';
import type { AppConfigRepository } from '@domain/repositories/app-config.repository';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';

function makeConfigRecord(key: string, value: string): AppConfig {
  return new AppConfig({
    id: randomUUID(),
    key,
    value,
    category: ConfigCategory.MAINTENANCE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUseCase(overrides?: {
  repo?: Partial<AppConfigRepository>;
  cache?: Partial<ConfigCache>;
  audit?: Partial<AuditLogger>;
}) {
  const repo: AppConfigRepository = {
    findByKey: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation((c: AppConfig) => Promise.resolve(c)),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides?.repo,
  };
  const cache: ConfigCache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
    ...overrides?.cache,
  };
  const audit: AuditLogger = {
    log: jest.fn().mockResolvedValue(undefined),
    ...overrides?.audit,
  };

  const uc = new SetMaintenanceModeUseCase(repo, cache, audit);
  return { uc, repo, cache, audit };
}

describe('SetMaintenanceModeUseCase', () => {
  it('creates maintenance.enabled = "true" when no existing config', async () => {
    const { uc, repo, cache, audit } = makeUseCase();

    const result = await uc.execute({ enabled: true, message: 'Down for maintenance' });

    expect(result.enabled).toBe(true);
    expect(result.message).toBe('Down for maintenance');
    expect(repo.save).toHaveBeenCalledTimes(2);
    expect(cache.del).toHaveBeenCalledWith(`config:${MAINTENANCE_KEY}`);
    expect(cache.del).toHaveBeenCalledWith(`config:${MAINTENANCE_MESSAGE_KEY}`);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'MAINTENANCE_MODE_ENABLED' }));
  });

  it('updates existing config when already present', async () => {
    const existing = makeConfigRecord(MAINTENANCE_KEY, 'false');
    const { uc, repo } = makeUseCase({
      repo: { findByKey: jest.fn().mockResolvedValue(existing) },
    });

    const result = await uc.execute({ enabled: true });

    expect(repo.save).toHaveBeenCalled();
    expect(result.enabled).toBe(true);
  });

  it('sets enabled = false correctly', async () => {
    const { uc, audit } = makeUseCase();
    const result = await uc.execute({ enabled: false });

    expect(result.enabled).toBe(false);
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'MAINTENANCE_MODE_DISABLED' }));
  });

  it('sets message to null when not provided', async () => {
    const { uc } = makeUseCase();
    const result = await uc.execute({ enabled: true });
    expect(result.message).toBeNull();
  });

  it('logs with updatedBy when provided', async () => {
    const { uc, audit } = makeUseCase();
    await uc.execute({ enabled: true, updatedBy: 'admin-123' });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ performedBy: 'admin-123' }));
  });

  it('returns updatedAt as a Date', async () => {
    const { uc } = makeUseCase();
    const result = await uc.execute({ enabled: true });
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('upsert path: uses existing record for message key too', async () => {
    const existingEnabled = makeConfigRecord(MAINTENANCE_KEY, 'false');
    const existingMsg = makeConfigRecord(MAINTENANCE_MESSAGE_KEY, 'old msg');

    const findByKey = jest.fn()
      .mockResolvedValueOnce(existingEnabled)  // maintenance.enabled
      .mockResolvedValueOnce(existingMsg);     // maintenance.message

    const { uc, repo } = makeUseCase({ repo: { findByKey } });
    await uc.execute({ enabled: true, message: 'new msg' });
    expect(repo.save).toHaveBeenCalledTimes(2);
  });
});
