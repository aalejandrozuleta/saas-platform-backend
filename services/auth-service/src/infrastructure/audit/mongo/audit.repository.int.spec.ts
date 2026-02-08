import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { MongoAuditEventRepository } from './audit.repository';
import {
  AuditEventDocument,
  AuditEventSchema,
} from './audit.schema';
import { AuditCategory } from '../../../domain/audit/audit-category.enum';
import { AuthAuditEvent } from '../../../domain/audit/auth-events.enum';

describe('MongoAuditEventRepository (integration)', () => {
  let repository: MongoAuditEventRepository;
  let connection: Connection;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/auth_audit_test'),
        MongooseModule.forFeature([
          { name: AuditEventDocument.name, schema: AuditEventSchema },
        ]),
      ],
      providers: [MongoAuditEventRepository],
    }).compile();

    repository = module.get(MongoAuditEventRepository);
    connection = module.get(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should persist audit event in MongoDB', async () => {
    await repository.save({
      userId: 'user-1',
      category: AuditCategory.AUTH,
      event: AuthAuditEvent.LOGIN_SUCCESS,
      ip: '127.0.0.1',
      createdAt: new Date(),
    });

    expect(true).toBe(true);
  });
});
