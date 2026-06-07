import { MaintenanceWindow } from './maintenance-window.entity';

const past = new Date('2020-01-01');
const future = new Date('2099-01-01');

function makeWindow(startAt: Date, endAt: Date, isActive = true): MaintenanceWindow {
  return new MaintenanceWindow({
    id: 'w-1',
    title: 'Scheduled maintenance',
    description: 'DB upgrade',
    startAt,
    endAt,
    tenantId: null,
    isActive,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('MaintenanceWindow', () => {
  it('constructs correctly', () => {
    const now = new Date();
    const w = makeWindow(now, future);
    expect(w.title).toBe('Scheduled maintenance');
    expect(w.isActive).toBe(true);
    expect(w.notifiedAt).toBeNull();
  });

  it('isOngoing() true when within range', () => {
    const start = new Date(Date.now() - 1000);
    const end = new Date(Date.now() + 60_000);
    expect(makeWindow(start, end).isOngoing()).toBe(true);
  });

  it('isOngoing() false when before range', () => {
    const start = new Date(Date.now() + 10_000);
    const end = new Date(Date.now() + 60_000);
    expect(makeWindow(start, end).isOngoing()).toBe(false);
  });

  it('isOngoing() false when after range', () => {
    expect(makeWindow(past, past).isOngoing()).toBe(false);
  });

  it('isOngoing() false when inactive', () => {
    const start = new Date(Date.now() - 1000);
    const end = new Date(Date.now() + 60_000);
    expect(makeWindow(start, end, false).isOngoing()).toBe(false);
  });

  it('isPending() true when not yet started', () => {
    const start = new Date(Date.now() + 60_000);
    const end = new Date(Date.now() + 120_000);
    expect(makeWindow(start, end).isPending()).toBe(true);
  });

  it('isPending() false when already started', () => {
    const start = new Date(Date.now() - 1000);
    const end = new Date(Date.now() + 60_000);
    expect(makeWindow(start, end).isPending()).toBe(false);
  });

  it('cancel() deactivates the window', () => {
    const w = makeWindow(past, future);
    w.cancel();
    expect(w.isActive).toBe(false);
  });

  it('markNotified() sets notifiedAt', () => {
    const w = makeWindow(past, future);
    expect(w.notifiedAt).toBeNull();
    w.markNotified();
    expect(w.notifiedAt).toBeInstanceOf(Date);
  });

  it('toSnapshot() returns all fields', () => {
    const w = makeWindow(past, future);
    const snap = w.toSnapshot();
    expect(snap.title).toBe('Scheduled maintenance');
    expect(snap.isActive).toBe(true);
  });
});
