import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus as DomainUserStatus } from '@domain/enums/user-status.enum';
import { UserStatus as PrismaUserStatus } from '@prisma/client';

import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('debe mapear correctamente desde persistencia a dominio (ACTIVE)', () => {
      const raw = {
        id: 'uuid-active',
        email: 'active@example.com',
        passwordHash: 'hashed-password',
        status: PrismaUserStatus.ACTIVE,
        emailVerified: true,
        failedLoginAttempts: 0,
        blockedUntil: null,
        createdAt: new Date('2026-01-01'),
      };

      const user = UserMapper.toDomain(raw);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(raw.id);
      expect(user.email.getValue()).toBe(raw.email);
      expect(user.passwordHash).toBe(raw.passwordHash);
      expect(user.status).toBe(DomainUserStatus.ACTIVE);
      expect(user.emailVerified).toBe(true);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.blockedUntil).toBeUndefined();
      expect(user.createdAt).toEqual(raw.createdAt);
    });
  });

  describe('toPersistence', () => {
    it('debe mapear correctamente desde dominio a persistencia', () => {
      const user = User.fromPersistence({
        id: 'uuid-new',
        email: EmailVO.create('new@example.com'),
        passwordHash: 'hashed-password',
        status: DomainUserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 2,
        blockedUntil: undefined,
        createdAt: new Date(),
      });

      const persistence = UserMapper.toPersistence(user);

      expect(persistence).toEqual({
        id: user.id,
        email: 'new@example.com',
        passwordHash: 'hashed-password',
        status: PrismaUserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 2,
        blockedUntil: undefined,
      });
    });
  });

  describe('casos inválidos', () => {
    it('debe lanzar error si recibe estado Prisma no soportado', () => {
      const raw = {
        id: 'uuid-invalid',
        email: 'invalid@example.com',
        passwordHash: 'hash',
        status: 'INVALID_STATUS' as unknown as PrismaUserStatus,
        emailVerified: false,
        failedLoginAttempts: 0,
        blockedUntil: null,
        createdAt: new Date(),
      };

      expect(() => UserMapper.toDomain(raw)).toThrow(
        'Estado no soportado',
      );
    });
  });

  it('debe mapear correctamente estado PENDING', () => {
    const raw = {
      id: 'uuid-pending',
      email: 'pending@example.com',
      passwordHash: 'hash',
      status: PrismaUserStatus.PENDING,
      emailVerified: false,
      failedLoginAttempts: 0,
      blockedUntil: null,
      createdAt: new Date(),
    };

    const user = UserMapper.toDomain(raw);

    expect(user.status).toBe(DomainUserStatus.PENDING);
  });

  it('debe mapear correctamente estado BLOCKED', () => {
    const raw = {
      id: 'uuid-blocked',
      email: 'blocked@example.com',
      passwordHash: 'hash',
      status: PrismaUserStatus.BLOCKED,
      emailVerified: true,
      failedLoginAttempts: 5,
      blockedUntil: new Date(),
      createdAt: new Date(),
    };

    const user = UserMapper.toDomain(raw);

    expect(user.status).toBe(DomainUserStatus.BLOCKED);
  });

  it('debe mapear correctamente DomainStatus a PrismaStatus', () => {
    const user = User.fromPersistence({
      id: 'uuid-map',
      email: EmailVO.create('map@example.com'),
      passwordHash: 'hash',
      status: DomainUserStatus.PENDING,
      emailVerified: false,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
      createdAt: new Date(),
    });

    const persistence = UserMapper.toPersistence(user);

    expect(persistence.status).toBe(PrismaUserStatus.PENDING);
  });
});