import { model } from "mongoose";
import { AuditCategory } from "@domain/audit/audit-category.enum";

import { AuditEventDocument, AuditEventSchema } from "./mongo.service";



/**
 * Tests unitarios del AuditEventSchema
 *
 * - No conecta a MongoDB
 * - Valida reglas del schema
 * - Usa validateSync (unit test real)
 */
describe('AuditEventSchema', () => {
  const AuditEventModel = model<AuditEventDocument>(
    'AuditEvent',
    AuditEventSchema,
  );

  it('debe crear un documento válido con los campos obligatorios', () => {
    // Arrange
    const doc = new AuditEventModel({
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: 'REGISTER_SUCCESS',
      ip: '127.0.0.1',
      createdAt: new Date(),
    });

    // Act
    const error = doc.validateSync();

    // Assert
    expect(error).toBeUndefined();
  });

  it('debe permitir campos opcionales', () => {
    // Arrange
    const doc = new AuditEventModel({
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: 'REGISTER_FAILED',
      ip: '127.0.0.1',
      country: 'CO',
      deviceFingerprint: 'device-123',
      reason: 'EMAIL_ALREADY_EXISTS',
      metadata: {
        email: 'test@example.com',
      },
      createdAt: new Date(),
    });

    // Act
    const error = doc.validateSync();

    // Assert
    expect(error).toBeUndefined();
  });

  it('debe fallar si falta un campo requerido', () => {
    // Arrange
    const doc = new AuditEventModel({
      category: AuditCategory.AUTH,
      event: 'REGISTER_SUCCESS',
      ip: '127.0.0.1',
      createdAt: new Date(),
    });

    // Act
    const error = doc.validateSync();

    // Assert
    expect(error).toBeDefined();
    expect(error?.errors).toHaveProperty('userId');
  });

  it('debe fallar si category no pertenece al enum', () => {
    // Arrange
    const doc = new AuditEventModel({
      userId: 'user-id-123',
      category: 'INVALID_CATEGORY',
      event: 'REGISTER_SUCCESS',
      ip: '127.0.0.1',
      createdAt: new Date(),
    });

    // Act
    const error = doc.validateSync();

    // Assert
    expect(error).toBeDefined();
    expect(error?.errors).toHaveProperty('category');
  });

  it('debe permitir metadata como objeto libre', () => {
    const doc = new AuditEventModel({
      userId: 'user-id-123',
      category: AuditCategory.AUTH,
      event: 'REGISTER_SUCCESS',
      ip: '127.0.0.1',
      metadata: {
        nested: {
          foo: 123,
        },
      },
      createdAt: new Date(),
    });

    const error = doc.validateSync();

    expect(error).toBeUndefined();

    const metadata = doc.metadata as {
      nested: {
        foo: number;
      };
    };

    expect(metadata.nested.foo).toBe(123);
  });

});
