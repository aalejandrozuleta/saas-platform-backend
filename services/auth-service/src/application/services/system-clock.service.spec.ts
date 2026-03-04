import { SystemClock } from './system-clock.service';

describe('SystemClock', () => {
  let clock: SystemClock;

  beforeEach(() => {
    clock = new SystemClock();
  });

  it('debe retornar una instancia de Date', () => {
    const now = clock.now();

    expect(now).toBeInstanceOf(Date);
  });

  it('debe retornar una fecha cercana al tiempo actual', () => {
    const before = new Date();
    const now = clock.now();
    const after = new Date();

    expect(now.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(now.getTime()).toBeLessThanOrEqual(
      after.getTime(),
    );
  });

  it('no debe reutilizar la misma instancia de Date', () => {
    const first = clock.now();
    const second = clock.now();

    expect(first).not.toBe(second);
  });
});