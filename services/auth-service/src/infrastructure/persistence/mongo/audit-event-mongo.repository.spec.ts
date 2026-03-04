import { Model } from 'mongoose';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { AuditEvent } from '@domain/audit/audit-event.type';
import { AuthAuditEvent } from '@application/audit/auth-events.enum';

import { AuditEventMongoRepository } from './audit-event-mongo.repository';
import { AuditEventDocument } from './mongo.service';

/**
 * Tests unitarios del AuditEventMongoRepository.
 *
 * - No levanta conexión real a Mongo.
 * - Mockea completamente el Model de Mongoose.
 */
describe('AuditEventMongoRepository', () => {
  let repository: AuditEventMongoRepository;

  let model: {
    create: jest.Mock;
  };

  beforeEach(() => {
    model = {
      create: jest.fn(),
    };

    repository = new AuditEventMongoRepository(
      model as unknown as Model<AuditEventDocument>,
    );
  });

  it('debe guardar un evento de auditoría', async () => {
    const auditEvent: AuditEvent = {
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.REGISTER_SUCCESS,
      ip: '127.0.0.1',
      createdAt: new Date(),
    };

    model.create.mockResolvedValue({
      _id: 'mongo-id',
      ...auditEvent,
    });

    await repository.save(auditEvent);

    expect(model.create).toHaveBeenCalledTimes(1);
    expect(model.create).toHaveBeenCalledWith(auditEvent);
  });

  it('debe propagar errores del modelo', async () => {
    const auditEvent: AuditEvent = {
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.REGISTER_FAILED,
      ip: '127.0.0.1',
      createdAt: new Date(),
    };

    const error = new Error('Mongo error');
    model.create.mockRejectedValue(error);

    await expect(repository.save(auditEvent)).rejects.toThrow(
      'Mongo error',
    );
  });
});