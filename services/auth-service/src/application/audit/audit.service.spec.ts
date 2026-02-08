import { AuditEventRepository } from '@domain/audit/audit-event.repository';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { AuthAuditEvent } from '@domain/audit/auth-events.enum';

import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<AuditEventRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
    };

    service = new AuditService(repository);
  });

  it('should persist an audit event with createdAt', async () => {
    await service.log({
      userId: 'user-1',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_SUCCESS,
      ip: '127.0.0.1',
    });

    expect(repository.save).toHaveBeenCalledTimes(1);

    const savedEvent = repository.save.mock.calls[0][0];

    expect(savedEvent.userId).toBe('user-1');
    expect(savedEvent.createdAt).toBeInstanceOf(Date);
  });
});
