import { Model } from 'mongoose';
import { AuditEvent } from '@domain/audit/audit-event.type';
import { AuditCategory } from '@domain/audit/audit-category.enum';


import { AuditEventDocument } from './audit.schema';
import { MongoAuditEventRepository } from './audit.repository';

describe('MongoAuditEventRepository', () => {
  let repository: MongoAuditEventRepository;
  let model: jest.Mocked<Model<AuditEventDocument>>;

  beforeEach(() => {
    model = {
      create: jest.fn(),
    } as unknown as jest.Mocked<Model<AuditEventDocument>>;

    repository = new MongoAuditEventRepository(model);
  });

  describe('save', () => {
    it('debería guardar un evento de auditoría en MongoDB', async () => {
      const event: AuditEvent = {
        category: AuditCategory.AUTH,
        event: 'LOGIN_SUCCESS',
        metadata: { ip: '127.0.0.1' },
        createdAt: new Date(),
      };

      const mockDocument = {
        category: AuditCategory.AUTH,
        event: 'LOGIN_SUCCESS',
        metadata: { ip: '127.0.0.1' },
        createdAt: new Date(),
        _id: '507f1f77bcf86cd799439011',
        toJSON: jest.fn(),
      } as any;
      model.create.mockResolvedValue([mockDocument]);

      await repository.save(event);

      expect(model.create).toHaveBeenCalledTimes(1);
      expect(model.create).toHaveBeenCalledWith(event);
    });

    it('debería propagar el error si MongoDB falla', async () => {
      const event: AuditEvent = {
        category: AuditCategory.AUTH,
        event: 'LOGIN_FAILED',
        metadata: { ip: '127.0.0.1' },
        createdAt: new Date(),
      };

      model.create.mockRejectedValue(new Error('Mongo error'));

      await expect(repository.save(event)).rejects.toThrow('Mongo error');

      expect(model.create).toHaveBeenCalledTimes(1);
    });
  });
});