import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserRole as DomainUserRole } from '@domain/enums/user-role.enum';
import { UserStatus as DomainUserStatus } from '@domain/enums/user-status.enum';

import { UserRole as PrismaUserRole, UserStatus as PrismaUserStatus } from '../../../generated/prisma';

import { UserMapper } from './user.mapper';

const makeRaw = (overrides: Partial<{
  status: PrismaUserStatus;
  role: PrismaUserRole;
}> = {}) => ({
  id: 'uuid-1',
  email: 'user@example.com',
  passwordHash: 'hash',
  role: PrismaUserRole.CUSTOMER,
  status: PrismaUserStatus.ACTIVE,
  emailVerified: false,
  failedLoginAttempts: 0,
  lockoutCount: 0,
  lastLoginAt: null,
  blockedUntil: null,
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

const makeUserEntity = (overrides: Partial<{
  status: DomainUserStatus;
  role: DomainUserRole;
}> = {}) =>
  User.fromPersistence({
    id: 'uuid-new',
    email: EmailVO.create('new@example.com'),
    passwordHash: 'hashed-password',
    role: DomainUserRole.CUSTOMER,
    status: DomainUserStatus.ACTIVE,
    emailVerified: false,
    failedLoginAttempts: 2,
    lockoutCount: 0,
    blockedUntil: undefined,
    createdAt: new Date(),
    ...overrides,
  });

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('debe mapear correctamente desde persistencia a dominio (ACTIVE / CUSTOMER)', () => {
      const raw = makeRaw();
      const user = UserMapper.toDomain(raw);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(raw.id);
      expect(user.email.getValue()).toBe(raw.email);
      expect(user.passwordHash).toBe(raw.passwordHash);
      expect(user.role).toBe(DomainUserRole.CUSTOMER);
      expect(user.status).toBe(DomainUserStatus.ACTIVE);
      expect(user.emailVerified).toBe(false);
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.blockedUntil).toBeUndefined();
      expect(user.createdAt).toEqual(raw.createdAt);
    });

    it.each([
      [PrismaUserRole.SUPER_ADMIN,    DomainUserRole.SUPER_ADMIN],
      [PrismaUserRole.BUSINESS_OWNER, DomainUserRole.BUSINESS_OWNER],
      [PrismaUserRole.ACCOUNTANT,     DomainUserRole.ACCOUNTANT],
      [PrismaUserRole.EMPLOYEE,       DomainUserRole.EMPLOYEE],
      [PrismaUserRole.CUSTOMER,       DomainUserRole.CUSTOMER],
    ])('debe mapear rol %s desde Prisma a dominio', (prismaRole, domainRole) => {
      const user = UserMapper.toDomain(makeRaw({ role: prismaRole }));
      expect(user.role).toBe(domainRole);
    });

    it('debe mapear estado PENDING', () => {
      const user = UserMapper.toDomain(makeRaw({ status: PrismaUserStatus.PENDING }));
      expect(user.status).toBe(DomainUserStatus.PENDING);
    });

    it('debe mapear estado BLOCKED', () => {
      const raw = { ...makeRaw({ status: PrismaUserStatus.BLOCKED }), lockoutCount: 2 };
      const user = UserMapper.toDomain(raw);
      expect(user.status).toBe(DomainUserStatus.BLOCKED);
      expect(user.lockoutCount).toBe(2);
    });

    it('debe lanzar error si recibe estado Prisma no soportado', () => {
      const raw = makeRaw({ status: 'INVALID_STATUS' as unknown as PrismaUserStatus });
      expect(() => UserMapper.toDomain(raw)).toThrow('Estado no soportado');
    });

    it('debe lanzar error si recibe rol Prisma no soportado', () => {
      const raw = makeRaw({ role: 'INVALID_ROLE' as unknown as PrismaUserRole });
      expect(() => UserMapper.toDomain(raw)).toThrow('Estado no soportado');
    });
  });

  describe('toPersistence', () => {
    it('debe mapear correctamente desde dominio a persistencia (USER/ACTIVE)', () => {
      const user = makeUserEntity();
      const persistence = UserMapper.toPersistence(user);

      expect(persistence).toEqual({
        id: user.id,
        email: 'new@example.com',
        passwordHash: 'hashed-password',
        role: PrismaUserRole.CUSTOMER,
        status: PrismaUserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 2,
        blockedUntil: undefined,
      });
    });

    it.each([
      [DomainUserRole.SUPER_ADMIN,    PrismaUserRole.SUPER_ADMIN],
      [DomainUserRole.BUSINESS_OWNER, PrismaUserRole.BUSINESS_OWNER],
      [DomainUserRole.ACCOUNTANT,     PrismaUserRole.ACCOUNTANT],
      [DomainUserRole.EMPLOYEE,       PrismaUserRole.EMPLOYEE],
      [DomainUserRole.CUSTOMER,       PrismaUserRole.CUSTOMER],
    ])('debe mapear rol %s de dominio a Prisma', (domainRole, prismaRole) => {
      const user = makeUserEntity({ role: domainRole });
      expect(UserMapper.toPersistence(user).role).toBe(prismaRole);
    });

    it('debe mapear DomainStatus PENDING a PrismaStatus', () => {
      const user = makeUserEntity({ status: DomainUserStatus.PENDING });
      expect(UserMapper.toPersistence(user).status).toBe(PrismaUserStatus.PENDING);
    });

    it('debe mapear DomainStatus BLOCKED a PrismaStatus', () => {
      const user = makeUserEntity({ status: DomainUserStatus.BLOCKED });
      expect(UserMapper.toPersistence(user).status).toBe(PrismaUserStatus.BLOCKED);
    });

    it('debe lanzar error si DomainStatus es inválido en toPrismaStatus', () => {
      const user = makeUserEntity({ status: 'INVALID_STATUS' as unknown as DomainUserStatus });
      expect(() => UserMapper.toPersistence(user)).toThrow('Estado no soportado');
    });

    it('debe lanzar error si DomainRole es inválido en toPrismaRole', () => {
      const user = makeUserEntity({ role: 'INVALID_ROLE' as unknown as DomainUserRole });
      expect(() => UserMapper.toPersistence(user)).toThrow('Estado no soportado');
    });
  });
});
