import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { type TotpEncryptionPort } from '@application/ports/totp-encryption.port';

import { SecurityPrismaRepository } from './security-prisma.repository';
import { type PrismaService } from './prisma.service';

describe('SecurityPrismaRepository', () => {
  let repository: SecurityPrismaRepository;

  let prisma: any;
  let totpEncryption: jest.Mocked<TotpEncryptionPort>;

  beforeEach(() => {
    prisma = {
      user: {
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    totpEncryption = {
      encrypt: jest.fn((plaintext: string) => plaintext),
      decrypt: jest.fn((ciphertext: string) => ciphertext),
    };

    repository = new SecurityPrismaRepository(
      prisma as PrismaService,
      totpEncryption,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerFailedAttempt', () => {
    it('debe incrementar intentos fallidos', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValue({
        failedLoginAttempts: 1,
      });

      await repository.registerFailedAttempt(
        'user-1',
        5,
        10,
        new Date(),
      );

      expect(prisma.user.updateMany).toHaveBeenCalled();
      expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it('debe lanzar error si el usuario ya está bloqueado', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 0 });

      const error = new Error('blocked');
      jest
        .spyOn(DomainErrorFactory, 'userBlocked')
        .mockReturnValue(error as any);

      await expect(
        repository.registerFailedAttempt(
          'user-1',
          5,
          10,
          new Date(),
        ),
      ).rejects.toThrow(error);
    });

    it('debe bloquear usuario al alcanzar el máximo de intentos', async () => {
      prisma.user.updateMany.mockResolvedValue({ count: 1 });
      prisma.user.findUnique.mockResolvedValue({
        failedLoginAttempts: 5,
      });

      await repository.registerFailedAttempt(
        'user-1',
        5,
        10,
        new Date(),
      );

      expect(prisma.user.update).toHaveBeenCalled();

      const args = prisma.user.update.mock.calls[0][0];
      expect(args.data.blockedUntil).toBeInstanceOf(Date);
      expect(args.data.status).toBeUndefined();
    });
  });

  describe('resetFailedLoginAttempts', () => {
    it('debe resetear intentos fallidos', async () => {
      await repository.resetFailedLoginAttempts('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          failedLoginAttempts: 0,
          blockedUntil: null,
        },
      });
    });
  });

  describe('releaseTemporaryBlock', () => {
    it('debe liberar un bloqueo temporal heredado', async () => {
      await repository.releaseTemporaryBlock('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          failedLoginAttempts: 0,
          blockedUntil: null,
          status: 'ACTIVE',
        },
      });
    });
  });

  describe('updateLastPasswordChange', () => {
    it('debe hacer upsert de la fecha de último cambio de contraseña', async () => {
      const now = new Date('2026-01-01T00:00:00Z');
      prisma.userSecurity = { upsert: jest.fn() };

      await repository.updateLastPasswordChange('user-1', now);

      expect(prisma.userSecurity.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { lastPasswordChange: now },
        create: { userId: 'user-1', lastPasswordChange: now },
      });
    });
  });

  describe('saveTotpPendingSecret', () => {
    it('debe cifrar y guardar el secreto TOTP pendiente', async () => {
      prisma.userSecurity = { upsert: jest.fn() };
      totpEncryption.encrypt.mockReturnValue('encrypted-secret');

      await repository.saveTotpPendingSecret('user-1', 'plain-secret');

      expect(totpEncryption.encrypt).toHaveBeenCalledWith('plain-secret');
      expect(prisma.userSecurity.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { totpPendingSecret: 'encrypted-secret' },
        create: { userId: 'user-1', totpPendingSecret: 'encrypted-secret' },
      });
    });
  });

  describe('activateTwoFactor', () => {
    it('debe activar 2FA usando el secreto pendiente existente', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ totpPendingSecret: 'pending-secret' }),
        update: jest.fn(),
      };

      await repository.activateTwoFactor('user-1');

      expect(prisma.userSecurity.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: 'TOTP',
          totpSecret: 'pending-secret',
          totpPendingSecret: null,
        },
      });
    });

    it('debe usar null si no hay secreto pendiente', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      };

      await repository.activateTwoFactor('user-1');

      expect(prisma.userSecurity.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: expect.objectContaining({ totpSecret: null }),
      });
    });
  });

  describe('disableTwoFactor', () => {
    it('debe desactivar 2FA y limpiar los secretos', async () => {
      prisma.userSecurity = { update: jest.fn() };

      await repository.disableTwoFactor('user-1');

      expect(prisma.userSecurity.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          twoFactorEnabled: false,
          twoFactorMethod: null,
          totpSecret: null,
          totpPendingSecret: null,
        },
      });
    });
  });

  describe('getTotpSecret', () => {
    it('debe descifrar y retornar el secreto TOTP', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ totpSecret: 'encrypted-secret' }),
      };
      totpEncryption.decrypt.mockReturnValue('plain-secret');

      const result = await repository.getTotpSecret('user-1');

      expect(totpEncryption.decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(result).toBe('plain-secret');
    });

    it('debe retornar null si no hay secreto guardado', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ totpSecret: null }),
      };

      const result = await repository.getTotpSecret('user-1');

      expect(result).toBeNull();
      expect(totpEncryption.decrypt).not.toHaveBeenCalled();
    });
  });

  describe('getTotpPendingSecret', () => {
    it('debe descifrar y retornar el secreto TOTP pendiente', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ totpPendingSecret: 'encrypted-pending' }),
      };
      totpEncryption.decrypt.mockReturnValue('plain-pending');

      const result = await repository.getTotpPendingSecret('user-1');

      expect(totpEncryption.decrypt).toHaveBeenCalledWith('encrypted-pending');
      expect(result).toBe('plain-pending');
    });

    it('debe retornar null si no hay secreto pendiente guardado', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ totpPendingSecret: null }),
      };

      const result = await repository.getTotpPendingSecret('user-1');

      expect(result).toBeNull();
      expect(totpEncryption.decrypt).not.toHaveBeenCalled();
    });
  });

  describe('getTrustedCountries', () => {
    it('debe retornar los países de confianza del usuario', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ trustedCountries: ['CO', 'US'] }),
      };

      const result = await repository.getTrustedCountries('user-1');

      expect(prisma.userSecurity.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { trustedCountries: true },
      });
      expect(result).toEqual(['CO', 'US']);
    });

    it('debe retornar arreglo vacío si el usuario no tiene UserSecurity', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue(null),
      };

      const result = await repository.getTrustedCountries('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('addTrustedCountry', () => {
    it('debe hacer upsert agregando el país a la lista', async () => {
      prisma.userSecurity = { upsert: jest.fn() };

      await repository.addTrustedCountry('user-1', 'CO');

      expect(prisma.userSecurity.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { trustedCountries: { push: 'CO' } },
        create: { userId: 'user-1', trustedCountries: ['CO'] },
      });
    });
  });

  describe('removeTrustedCountry', () => {
    it('debe eliminar el país de la lista existente', async () => {
      prisma.userSecurity = {
        findUnique: jest.fn().mockResolvedValue({ trustedCountries: ['CO', 'US'] }),
        update: jest.fn(),
      };

      await repository.removeTrustedCountry('user-1', 'CO');

      expect(prisma.userSecurity.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { trustedCountries: ['US'] },
      });
    });
  });

  describe('findByUserId', () => {
    it('debe retornar valores por defecto si el usuario no tiene UserSecurity', async () => {
      prisma.user.findUnique.mockResolvedValue({
        security: null,
        recoveryCodes: [],
      });

      const result = await repository.findByUserId('user-no-security');

      expect(result).toEqual({
        trustedCountries: [],
        twoFactorEnabled: false,
        twoFactorMethod: undefined,
        hasRecoveryCodes: false,
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByUserId('nonexistent');

      expect(result).toBeNull();
    });

    it('debe consultar el perfil de seguridad del usuario', async () => {
      prisma.user.findUnique.mockResolvedValue({
        security: {
          trustedCountries: ['CO'],
          twoFactorEnabled: true,
          twoFactorMethod: 'TOTP',
        },
        recoveryCodes: [{ id: 'rc-1' }],
      });

      const result = await repository.findByUserId('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          security: {
            select: {
              trustedCountries: true,
              twoFactorEnabled: true,
              twoFactorMethod: true,
            },
          },
          recoveryCodes: {
            take: 1,
            select: { id: true },
          },
        },
      });

      expect(result).toEqual({
        trustedCountries: ['CO'],
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP',
        hasRecoveryCodes: true,
      });
    });
  });
});
