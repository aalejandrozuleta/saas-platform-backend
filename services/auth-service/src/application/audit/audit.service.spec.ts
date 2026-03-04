import { AuditEventRepository } from '@domain/audit/audit-event.repository';
import { AuditCategory } from '@domain/audit/audit-category.enum';

import { AuditService } from './audit.service';
import { AuthAuditEvent } from './auth-events.enum';

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<AuditEventRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
    };

    service = new AuditService(repository);
  });

  it('debe persistir un evento agregando createdAt automáticamente', async () => {
    await service.log({
      userId: 'user-1',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_SUCCESS,
      ip: '127.0.0.1',
      country: 'CO',
    });

    expect(repository.save).toHaveBeenCalledTimes(1);

    const savedEvent = repository.save.mock.calls[0][0];

    expect(savedEvent).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        category: AuditCategory.AUTH,
        event: AuthAuditEvent.LOGIN_SUCCESS,
        ip: '127.0.0.1',
        country: 'CO',
      }),
    );

    expect(savedEvent.createdAt).toBeInstanceOf(Date);
  });

  it('debe propagar errores del repositorio', async () => {
    repository.save.mockRejectedValue(
      new Error('Mongo failure'),
    );

    await expect(
      service.log({
        userId: 'user-1',
        category: AuditCategory.AUTH,
        event: AuthAuditEvent.LOGIN_SUCCESS,
        ip: '127.0.0.1',
      }),
    ).rejects.toThrow('Mongo failure');
  });
});