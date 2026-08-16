import { EmailVO } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/enums/user-role.enum';
import { UserStatus } from '@domain/enums/user-status.enum';

import { User } from './user.entity';

describe('User entity', () => {
  const makeUser = (
    overrides: Partial<{
      status: UserStatus;
      role: UserRole;
      failedLoginAttempts: number;
      blockedUntil: Date | undefined;
      lockoutCount: number;
    }> = {},
  ) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      mustChangePassword: false,
      blockedUntil: undefined,
      createdAt: new Date(),
      ...overrides,
    });

  describe('create', () => {
    it('debe crear usuario con rol CUSTOMER por defecto', () => {
      const user = User.create({
        id: 'new-id',
        email: EmailVO.create('new@example.com'),
        passwordHash: 'hash',
      });

      expect(user.role).toBe(UserRole.CUSTOMER);
      expect(user.status).toBe(UserStatus.PENDING);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.emailVerified).toBe(false);
    });

    it.each([
      UserRole.SUPER_ADMIN,
      UserRole.BUSINESS_OWNER,
      UserRole.ACCOUNTANT,
      UserRole.EMPLOYEE,
      UserRole.CUSTOMER,
    ])('debe respetar el rol %s cuando se especifica', (role) => {
      const user = User.create({
        id: `id-${role}`,
        email: EmailVO.create(`${role.toLowerCase()}@example.com`),
        passwordHash: 'hash',
        role,
      });
      expect(user.role).toBe(role);
    });

    it('debe tener mustChangePassword=false por defecto', () => {
      const user = User.create({
        id: 'new-id',
        email: EmailVO.create('new@example.com'),
        passwordHash: 'hash',
      });

      expect(user.mustChangePassword).toBe(false);
    });

    it('debe respetar mustChangePassword=true cuando se especifica (worker provisionado)', () => {
      const user = User.create({
        id: 'new-id',
        email: EmailVO.create('worker@example.com'),
        passwordHash: 'hash',
        mustChangePassword: true,
      });

      expect(user.mustChangePassword).toBe(true);
    });
  });

  describe('getter mustChangePassword', () => {
    it('debe devolver el valor asignado', () => {
      const user = makeUser();
      expect(user.mustChangePassword).toBe(false);
    });
  });

  describe('changePasswordAndClearRequirement', () => {
    it('debe reemplazar el passwordHash y limpiar mustChangePassword', () => {
      const user = User.create({
        id: 'new-id',
        email: EmailVO.create('worker@example.com'),
        passwordHash: 'temp-hash',
        mustChangePassword: true,
      });

      const updated = user.changePasswordAndClearRequirement('new-hash');

      expect(updated.passwordHash).toBe('new-hash');
      expect(updated.mustChangePassword).toBe(false);
      // inmutabilidad
      expect(user.passwordHash).toBe('temp-hash');
      expect(user.mustChangePassword).toBe(true);
    });
  });

  describe('getter role', () => {
    it('debe devolver el rol asignado al usuario', () => {
      const user = makeUser({ role: UserRole.BUSINESS_OWNER });
      expect(user.role).toBe(UserRole.BUSINESS_OWNER);
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
      const user = makeUser({ failedLoginAttempts: 3, lockoutCount: 0, blockedUntil: future });
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

  describe('requestVerification', () => {
    it('debe asignar el token y la fecha de expiración de verificación', () => {
      const expiresAt = new Date(Date.now() + 60_000);
      const user = makeUser();
      const updated = user.requestVerification('token-abc', expiresAt);

      expect(updated.emailVerificationToken).toBe('token-abc');
      expect(updated.emailVerificationExpiresAt).toBe(expiresAt);
      // inmutabilidad
      expect(user.emailVerificationToken).toBeUndefined();
    });
  });

  describe('verifyEmail', () => {
    it('debe marcar el email como verificado, activar el usuario y limpiar el token', () => {
      const user = makeUser({ status: UserStatus.PENDING }).requestVerification(
        'token-abc',
        new Date(Date.now() + 60_000),
      );

      const verified = user.verifyEmail();

      expect(verified.emailVerified).toBe(true);
      expect(verified.status).toBe(UserStatus.ACTIVE);
      expect(verified.emailVerificationToken).toBeUndefined();
      expect(verified.emailVerificationExpiresAt).toBeUndefined();
    });
  });

  describe('isEmailVerificationTokenExpired', () => {
    it('debe devolver true si no hay fecha de expiración', () => {
      const user = makeUser();
      expect(user.isEmailVerificationTokenExpired(new Date())).toBe(true);
    });

    it('debe devolver true si la fecha de expiración ya pasó', () => {
      const user = makeUser().requestVerification('token-abc', new Date(Date.now() - 1000));
      expect(user.isEmailVerificationTokenExpired(new Date())).toBe(true);
    });

    it('debe devolver false si la fecha de expiración está en el futuro', () => {
      const user = makeUser().requestVerification('token-abc', new Date(Date.now() + 60_000));
      expect(user.isEmailVerificationTokenExpired(new Date())).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('debe asignar el token y la fecha de expiración de recuperación', () => {
      const expiresAt = new Date(Date.now() + 60_000);
      const user = makeUser();
      const updated = user.requestPasswordReset('reset-token-abc', expiresAt);

      expect(updated.passwordResetToken).toBe('reset-token-abc');
      expect(updated.passwordResetExpiresAt).toBe(expiresAt);
      // inmutabilidad
      expect(user.passwordResetToken).toBeUndefined();
    });
  });

  describe('consumePasswordReset', () => {
    it('debe limpiar el token de recuperación tras su uso', () => {
      const user = makeUser().requestPasswordReset(
        'reset-token-abc',
        new Date(Date.now() + 60_000),
      );

      const consumed = user.consumePasswordReset();

      expect(consumed.passwordResetToken).toBeUndefined();
      expect(consumed.passwordResetExpiresAt).toBeUndefined();
    });
  });

  describe('isPasswordResetTokenExpired', () => {
    it('debe devolver true si no hay fecha de expiración', () => {
      const user = makeUser();
      expect(user.isPasswordResetTokenExpired(new Date())).toBe(true);
    });

    it('debe devolver true si la fecha de expiración ya pasó', () => {
      const user = makeUser().requestPasswordReset('reset-token-abc', new Date(Date.now() - 1000));
      expect(user.isPasswordResetTokenExpired(new Date())).toBe(true);
    });

    it('debe devolver false si la fecha de expiración está en el futuro', () => {
      const user = makeUser().requestPasswordReset(
        'reset-token-abc',
        new Date(Date.now() + 60_000),
      );
      expect(user.isPasswordResetTokenExpired(new Date())).toBe(false);
    });
  });
});
