import { EmailVO } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/enums/user-role.enum';
import { UserStatus } from '@domain/enums/user-status.enum';

import { User } from './user.entity';

describe('User entity', () => {
  const makeUser = (overrides: Partial<{
    status: UserStatus;
    role: UserRole;
    failedLoginAttempts: number;
    blockedUntil: Date | undefined;
    lockoutCount: number;
  }> = {}) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      blockedUntil: undefined,
      createdAt: new Date(),
      ...overrides,
    });

  describe('create', () => {
    it('debe crear un usuario con rol USER por defecto, estado ACTIVE y failedLoginAttempts en 0', () => {
      const user = User.create({
        id: 'new-id',
        email: EmailVO.create('new@example.com'),
        passwordHash: 'hash',
      });

      expect(user.role).toBe(UserRole.USER);
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.emailVerified).toBe(false);
    });

    it('debe crear un usuario con rol SUPER_ADMIN cuando se especifica', () => {
      const user = User.create({
        id: 'admin-id',
        email: EmailVO.create('admin@example.com'),
        passwordHash: 'hash',
        role: UserRole.SUPER_ADMIN,
      });

      expect(user.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('debe crear un usuario con rol ADMIN cuando se especifica', () => {
      const user = User.create({
        id: 'admin-id',
        email: EmailVO.create('admin@example.com'),
        passwordHash: 'hash',
        role: UserRole.ADMIN,
      });

      expect(user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('getter role', () => {
    it('debe devolver el rol asignado al usuario', () => {
      const user = makeUser({ role: UserRole.ADMIN });
      expect(user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('isBlocked', () => {
    it('debe devolver true si blockedUntil está en el futuro', () => {
      const future = new Date(Date.now() + 60_000);
      const user = makeUser({ blockedUntil: future });

      expect(user.isBlocked()).toBe(true);
    });

    it('debe devolver false si blockedUntil es undefined', () => {
      const user = makeUser({ blockedUntil: undefined });

      expect(user.isBlocked()).toBe(false);
    });

    it('debe devolver false si blockedUntil está en el pasado', () => {
      const past = new Date(Date.now() - 60_000);
      const user = makeUser({ blockedUntil: past });

      expect(user.isBlocked()).toBe(false);
    });
  });

  describe('increaseFailedAttempts', () => {
    it('debe retornar un nuevo User con failedLoginAttempts incrementado', () => {
      const user = makeUser({ failedLoginAttempts: 2 });
      const updated = user.increaseFailedAttempts();

      expect(updated.failedLoginAttempts).toBe(3);
      // inmutabilidad — el original no cambia
      expect(user.failedLoginAttempts).toBe(2);
    });
  });

  describe('resetFailedAttempts', () => {
    it('debe retornar un nuevo User con intentos en 0 y blockedUntil undefined', () => {
      const future = new Date(Date.now() + 60_000);
      const user = makeUser({ failedLoginAttempts: 3,
      lockoutCount: 0, blockedUntil: future });
      const reset = user.resetFailedAttempts();

      expect(reset.failedLoginAttempts).toBe(0);
      expect(reset.blockedUntil).toBeUndefined();
    });
  });

  describe('getter lastLoginAt', () => {
    it('retorna undefined cuando no hay lastLoginAt', () => {
      const user = makeUser();
      expect(user.lastLoginAt).toBeUndefined();
    });
  });
});
