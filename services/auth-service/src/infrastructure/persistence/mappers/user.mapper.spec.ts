import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus as DomainUserStatus } from '@domain/enums/user-status.enum';

import { PrismaUserStatus } from '../enums/prisma-user-status.enum';

import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('debe mapear correctamente desde persistencia a dominio (ACTIVE)', () => {
      const raw = {
        id: 'uuid-active',
        email: 'active@example.com',
        passwordHash: 'hashed-password',
        status: PrismaUserStatus.ACTIVE,
        createdAt: new Date('2026-01-01'),
      };

      const user = UserMapper.toDomain(raw);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(raw.id);
      expect(user.email.getValue()).toBe(raw.email);
      expect(user.passwordHash).toBe(raw.passwordHash);
      expect(user.status).toBe(DomainUserStatus.ACTIVE);
      expect(user.createdAt).toEqual(raw.createdAt);
    });

    it('debe mapear correctamente desde persistencia a dominio (PENDING)', () => {
      const raw = {
        id: 'uuid-pending',
        email: 'pending@example.com',
        passwordHash: 'hash',
        status: PrismaUserStatus.PENDING,
        createdAt: new Date(),
      };

      const user = UserMapper.toDomain(raw);

      expect(user.status).toBe(DomainUserStatus.PENDING);
    });

    it('debe mapear correctamente desde persistencia a dominio (BLOCKED)', () => {
      const raw = {
        id: 'uuid-blocked',
        email: 'blocked@example.com',
        passwordHash: 'hash',
        status: PrismaUserStatus.BLOCKED,
        createdAt: new Date(),
      };

      const user = UserMapper.toDomain(raw);

      expect(user.status).toBe(DomainUserStatus.BLOCKED);
    });
  });

  describe('toPersistence', () => {
    it('debe mapear correctamente desde dominio a persistencia (usuario nuevo)', () => {
      // create() NO recibe status → el dominio lo define internamente
      const user = User.create({
        id: 'uuid-new',
        email: EmailVO.create('new@example.com'),
        passwordHash: 'hashed-password',
      });

      const persistence = UserMapper.toPersistence(user);

      expect(persistence).toEqual({
        id: 'uuid-new',
        email: 'new@example.com',
        passwordHash: 'hashed-password',
        status: PrismaUserStatus.ACTIVE, // estado inicial del dominio
      });
    });

    it('debe mapear correctamente status PENDING desde dominio a persistencia', () => {
      const user = User.fromPersistence({
        id: 'uuid-pending',
        email: EmailVO.create('pending@example.com'),
        passwordHash: 'hash',
        status: DomainUserStatus.PENDING,
        createdAt: new Date(),
      });

      const persistence = UserMapper.toPersistence(user);

      expect(persistence.status).toBe(PrismaUserStatus.PENDING);
    });

    it('debe mapear correctamente status BLOCKED desde dominio a persistencia', () => {
      const user = User.fromPersistence({
        id: 'uuid-blocked',
        email: EmailVO.create('blocked@example.com'),
        passwordHash: 'hash',
        status: DomainUserStatus.BLOCKED,
        createdAt: new Date(),
      });

      const persistence = UserMapper.toPersistence(user);

      expect(persistence.status).toBe(PrismaUserStatus.BLOCKED);
    });
  });
  describe('UserMapper - casos inválidos', () => {
    it('debe lanzar error si recibe un estado de Prisma no soportado', () => {
      const raw = {
        id: 'uuid-invalid',
        email: 'invalid@example.com',
        passwordHash: 'hash',
        status: 'INVALID_STATUS' as unknown as PrismaUserStatus,
        createdAt: new Date(),
      };

      expect(() => UserMapper.toDomain(raw)).toThrow(
        'Estado no soportado',
      );
    });

    it('debe lanzar error si recibe un estado de dominio no soportado', () => {
      const user = User.fromPersistence({
        id: 'uuid-invalid',
        email: EmailVO.create('invalid@example.com'),
        passwordHash: 'hash',
        status: 'INVALID_STATUS' as unknown as DomainUserStatus,
        createdAt: new Date(),
      });

      expect(() => UserMapper.toPersistence(user)).toThrow(
        'Estado no soportado',
      );
    });
  });

});
