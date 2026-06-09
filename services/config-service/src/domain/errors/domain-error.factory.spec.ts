import { ErrorCode } from '@saas/shared';

import { DomainErrorFactory } from './domain-error.factory';

describe('DomainErrorFactory', () => {
  it('featureFlagNotFound returns NOT_FOUND with key in metadata', () => {
    const err = DomainErrorFactory.featureFlagNotFound('flag_x');
    expect(err.code).toBe(ErrorCode.NOT_FOUND);
    expect(err.metadata).toMatchObject({ key: 'flag_x' });
  });

  it('maintenanceWindowNotFound returns NOT_FOUND with id in metadata', () => {
    const err = DomainErrorFactory.maintenanceWindowNotFound('win-id');
    expect(err.code).toBe(ErrorCode.NOT_FOUND);
    expect(err.metadata).toMatchObject({ id: 'win-id' });
  });

  it('maintenanceWindowOverlap returns CONFLICT', () => {
    const err = DomainErrorFactory.maintenanceWindowOverlap();
    expect(err.code).toBe(ErrorCode.CONFLICT);
  });

  it('invalidDateRange returns VALIDATION_ERROR', () => {
    const err = DomainErrorFactory.invalidDateRange();
    expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
  });
});
