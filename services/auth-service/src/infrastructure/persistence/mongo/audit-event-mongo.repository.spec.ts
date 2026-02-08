import { Model } from 'mongoose';
import { AuditCategory } from '@domain/audit/audit-category.enum';
import { AuthAuditEvent } from '@domain/audit/auth-events.enum';

import { AuditEventMongoRepository } from './audit-event-mongo.repository';
import { AuditEventDocument } from './mongo.service';
/**
 * Tests unitarios del AuditEventMongoRepository
 */
describe('AuditEventMongoRepository', () => {
  let repository: AuditEventMongoRepository;

  /**
   * Mock explícito del Model de Mongoose
   * No forzamos tipos de retorno de create
   */
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
    // Arrange
    const auditEvent = {
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.REGISTER_SUCCESS,
      ip: '127.0.0.1',
      createdAt: new Date(),
    };

    model.create.mockResolvedValue(undefined);

    // Act
    await repository.save(auditEvent);

    // Assert
    expect(model.create).toHaveBeenCalledTimes(1);
    expect(model.create).toHaveBeenCalledWith(auditEvent);
  });

  it('debe propagar errores del modelo', async () => {
    // Arrange
    const auditEvent = {
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.REGISTER_FAILED,
      ip: '127.0.0.1',
      createdAt: new Date(),
    };

    const error = new Error('Mongo error');
    model.create.mockRejectedValue(error);

    // Act + Assert
    await expect(repository.save(auditEvent)).rejects.toThrow(
      'Mongo error',
    );
  });
});
