import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRole } from '@domain/enums/user-role.enum';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { ErrorCode } from '@saas/shared';

import { LoginChallengeReason, LoginVerificationMethodType } from './login-challenge.types';
import { LoginSecurityChallengeService } from './login-security-challenge.service';

describe('LoginSecurityChallengeService', () => {
  let service: LoginSecurityChallengeService;

  const context = LoginContext.create({
    ip: '127.0.0.1',
    country: 'CO',
    deviceFingerprint: 'device-abc',
  });

  const makeUser = (email = 'te@example.com') =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create(email),
      passwordHash: 'hash',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      createdAt: new Date(),
    });

  beforeEach(() => {
    service = new LoginSecurityChallengeService();
  });

  describe('createChallenge', () => {
    it('debe lanzar SECURITY_CHALLENGE_REQUIRED con método EMAIL siempre disponible', () => {
      const exception = service.createChallenge(
        makeUser(),
        null,
        context,
        LoginChallengeReason.NEW_DEVICE,
      );

      expect(exception).toMatchObject({
        code: ErrorCode.SECURITY_CHALLENGE_REQUIRED,
      });

      const metadata = (exception as any).metadata;
      const methods: any[] = metadata.availableMethods;

      expect(methods.some(m => m.type === LoginVerificationMethodType.EMAIL)).toBe(true);
    });

    it('debe incluir método TOTP si el perfil tiene 2FA con TOTP activado', () => {
      const profile = {
        trustedCountries: [],
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP' as const,
        hasRecoveryCodes: false,
      };

      const exception = service.createChallenge(
        makeUser(),
        profile,
        context,
        LoginChallengeReason.UNTRUSTED_DEVICE,
      );

      const methods = (exception as any).metadata.availableMethods;
      expect(methods.some((m: any) => m.type === LoginVerificationMethodType.TOTP)).toBe(true);
    });

    it('debe incluir método SMS si el perfil tiene 2FA con SMS activado', () => {
      const profile = {
        trustedCountries: [],
        twoFactorEnabled: true,
        twoFactorMethod: 'SMS' as const,
        hasRecoveryCodes: false,
      };

      const exception = service.createChallenge(
        makeUser(),
        profile,
        context,
        LoginChallengeReason.NEW_DEVICE,
      );

      const methods = (exception as any).metadata.availableMethods;
      expect(methods.some((m: any) => m.type === LoginVerificationMethodType.SMS)).toBe(true);
    });

    it('debe incluir método RECOVERY_CODE si el perfil tiene códigos de recuperación', () => {
      const profile = {
        trustedCountries: [],
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP' as const,
        hasRecoveryCodes: true,
      };

      const exception = service.createChallenge(
        makeUser(),
        profile,
        context,
        LoginChallengeReason.NEW_DEVICE,
      );

      const methods = (exception as any).metadata.availableMethods;
      expect(
        methods.some((m: any) => m.type === LoginVerificationMethodType.RECOVERY_CODE),
      ).toBe(true);
    });

    it('debe enmascarar el email del usuario en el método EMAIL', () => {
      const exception = service.createChallenge(
        makeUser('usuario@example.com'),
        null,
        context,
        LoginChallengeReason.NEW_DEVICE,
      );

      const methods = (exception as any).metadata.availableMethods;
      const emailMethod = methods.find((m: any) => m.type === LoginVerificationMethodType.EMAIL);

      expect(emailMethod.destination).toMatch(/^us\*+@example\.com$/);
    });

    it('debe devolver el email sin cambios si no tiene el formato user@domain', () => {
      // Forzamos un email inválido a través del mock del Value Object
      const user = User.fromPersistence({
        id: 'user-x',
        email: { getValue: () => 'noemail' } as any,
        passwordHash: 'hash',
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 0,
      lockoutCount: 0,
        createdAt: new Date(),
      });

      const exception = service.createChallenge(
        user,
        null,
        context,
        LoginChallengeReason.NEW_DEVICE,
      );

      const methods = (exception as any).metadata.availableMethods;
      const emailMethod = methods.find((m: any) => m.type === LoginVerificationMethodType.EMAIL);
      // email sin @ → se retorna tal cual
      expect(emailMethod.destination).toBe('noemail');
    });
  });
});
