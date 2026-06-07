import { ConfigCategory } from '@domain/enums/config-category.enum';
import { AppConfig } from './app-config.entity';

function makeConfig(value = 'true'): AppConfig {
  return new AppConfig({
    id: 'id-1',
    key: 'maintenance.enabled',
    value,
    description: 'Controls maintenance mode',
    category: ConfigCategory.MAINTENANCE,
    updatedBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });
}

describe('AppConfig', () => {
  it('constructs with all properties', () => {
    const cfg = makeConfig();
    expect(cfg.id).toBe('id-1');
    expect(cfg.key).toBe('maintenance.enabled');
    expect(cfg.value).toBe('true');
    expect(cfg.description).toBe('Controls maintenance mode');
    expect(cfg.category).toBe(ConfigCategory.MAINTENANCE);
    expect(cfg.updatedBy).toBe('admin');
  });

  it('sets description and updatedBy to null when omitted', () => {
    const cfg = new AppConfig({
      id: 'id-2',
      key: 'x',
      value: 'y',
      category: ConfigCategory.GENERAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(cfg.description).toBeNull();
    expect(cfg.updatedBy).toBeNull();
  });

  it('isEnabled returns true for "true"', () => {
    expect(makeConfig('true').isEnabled()).toBe(true);
    expect(makeConfig('TRUE').isEnabled()).toBe(true);
  });

  it('isEnabled returns false for anything else', () => {
    expect(makeConfig('false').isEnabled()).toBe(false);
    expect(makeConfig('1').isEnabled()).toBe(false);
    expect(makeConfig('').isEnabled()).toBe(false);
  });

  it('setValue updates value and updatedAt', () => {
    const cfg = makeConfig('false');
    const before = cfg.updatedAt.getTime();
    cfg.setValue('true');
    expect(cfg.value).toBe('true');
    expect(cfg.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('toSnapshot returns a plain object with all fields', () => {
    const cfg = makeConfig();
    const snap = cfg.toSnapshot();
    expect(snap).toMatchObject({
      id: 'id-1',
      key: 'maintenance.enabled',
      value: 'true',
      category: ConfigCategory.MAINTENANCE,
    });
  });
});
