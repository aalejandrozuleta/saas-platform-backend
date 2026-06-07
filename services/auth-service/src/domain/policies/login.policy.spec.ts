import { UserStatus } from '@domain/enums/user-status.enum';

import { LoginPolicy } from './login.policy';

describe('LoginPolicy', () => {
  let policy: LoginPolicy;

  beforeEach(() => {
    policy = new LoginPolicy(3);
  });

  describe('validateUserStatus', () => {
    it('no debe lanzar error si está ACTIVE', () => {
      expect(() =>
        policy.validateUserStatus(UserStatus.ACTIVE),
      ).not.toThrow();
    });

    it('debe lanzar error si no está ACTIVE', () => {
      expect(() =>
        policy.validateUserStatus(UserStatus.BLOCKED),
      ).toThrow(Error);
    });
  });

  describe('validateAttempts', () => {
    it('debe lanzar error si el usuario sigue bloqueado', () => {
      const future = new Date(Date.now() + 10000);

      expect(() =>
        policy.validateAttempts(0, future, new Date()),
      ).toThrow(Error);
    });

    it('debe lanzar error si supera el máximo de intentos', () => {
      expect(() =>
        policy.validateAttempts(3, undefined, new Date()),
      ).toThrow(Error);
    });

    it('no debe lanzar error si no supera intentos y no está bloqueado', () => {
      expect(() =>
        policy.validateAttempts(1, undefined, new Date()),
      ).not.toThrow();
    });
  });

  describe('shouldLockAccount', () => {
    it('retorna true cuando alcanza maxAttempts', () => {
      expect(policy.shouldLockAccount(3)).toBe(true);
    });

    it('retorna false cuando no alcanza maxAttempts', () => {
      expect(policy.shouldLockAccount(2)).toBe(false);
    });
  });

  describe('lockDuration (progressive)', () => {
    it('1er bloqueo: 5 minutos', () => {
      expect(policy.lockDuration(0)).toBe(5);
    });

    it('2do bloqueo: 15 minutos', () => {
      expect(policy.lockDuration(1)).toBe(15);
    });

    it('3er bloqueo: 30 minutos', () => {
      expect(policy.lockDuration(2)).toBe(30);
    });

    it('4to+ bloqueo: 60 minutos', () => {
      expect(policy.lockDuration(3)).toBe(60);
      expect(policy.lockDuration(10)).toBe(60);
    });

    it('sin lockoutCount usa 5 minutos por defecto', () => {
      expect(policy.lockDuration()).toBe(5);
    });
  });

  describe('getMaxAttempts', () => {
    it('retorna el máximo configurado', () => {
      expect(policy.getMaxAttempts()).toBe(3);
    });
  });

  describe('validateDevice', () => {
    it('no lanza error si el dispositivo es confiable', () => {
      expect(() =>
        policy.validateDevice(true),
      ).not.toThrow();
    });

    it('lanza error si el dispositivo no es confiable', () => {
      expect(() =>
        policy.validateDevice(false),
      ).toThrow(Error);
    });
  });

  describe('validateCountry', () => {
    it('no lanza error si no hay lista de países', () => {
      expect(() =>
        policy.validateCountry(undefined, 'CO'),
      ).not.toThrow();
    });

    it('no lanza error si el país está permitido', () => {
      expect(() =>
        policy.validateCountry(['CO', 'US'], 'CO'),
      ).not.toThrow();
    });

    it('lanza error si el país no está permitido', () => {
      expect(() =>
        policy.validateCountry(['US'], 'CO'),
      ).toThrow(Error);
    });
  });

  describe('constructor con maxAttempts custom', () => {
    it('debe respetar maxAttempts personalizado', () => {
      const custom = new LoginPolicy(10);
      expect(custom.getMaxAttempts()).toBe(10);
    });
  });

  describe('validateDeviceFingerprint', () => {
    it('no lanza error si existe fingerprint', () => {
      expect(() =>
        policy.validateDeviceFingerprint('device-123'),
      ).not.toThrow();
    });

    it('lanza error si no existe fingerprint', () => {
      expect(() =>
        policy.validateDeviceFingerprint(undefined),
      ).toThrow(Error);
    });
  });
});
