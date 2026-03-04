import { UserStatus } from '@domain/enums/user-status.enum';

import { LoginPolicy } from './login.policy';

describe('LoginPolicy', () => {
  let policy: LoginPolicy;

  beforeEach(() => {
    policy = new LoginPolicy(3, 15);
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

  describe('lockDuration', () => {
    it('retorna la duración configurada', () => {
      expect(policy.lockDuration()).toBe(15);
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