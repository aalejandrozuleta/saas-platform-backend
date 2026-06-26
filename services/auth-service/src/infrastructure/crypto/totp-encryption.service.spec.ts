import { TotpEncryptionService } from './totp-encryption.service';
import { EnvService } from '@config/env/env.service';

const VALID_KEY = 'a'.repeat(64); // 32-byte hex key for tests

const mockEnv = {
  get: jest.fn().mockReturnValue(VALID_KEY),
} as unknown as EnvService;

describe('TotpEncryptionService', () => {
  let svc: TotpEncryptionService;

  beforeEach(() => {
    svc = new TotpEncryptionService(mockEnv);
  });

  it('cifra y descifra correctamente el mismo secreto', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const encrypted = svc.encrypt(secret);
    expect(encrypted).not.toBe(secret);
    expect(svc.decrypt(encrypted)).toBe(secret);
  });

  it('produce ciphertexts distintos en cada cifrado (IV aleatorio)', () => {
    const secret = 'SAME_SECRET';
    const c1 = svc.encrypt(secret);
    const c2 = svc.encrypt(secret);
    expect(c1).not.toBe(c2);
    expect(svc.decrypt(c1)).toBe(secret);
    expect(svc.decrypt(c2)).toBe(secret);
  });

  it('el ciphertext tiene el formato iv:authTag:data', () => {
    const encrypted = svc.encrypt('SECRET');
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveLength(24);  // 12 bytes IV → 24 hex chars
    expect(parts[1]).toHaveLength(32);  // 16 bytes authTag → 32 hex chars
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it('lanza error si el formato del ciphertext es inválido', () => {
    expect(() => svc.decrypt('garbage')).toThrow('Invalid TOTP ciphertext format');
    expect(() => svc.decrypt('a:b')).toThrow('Invalid TOTP ciphertext format');
  });

  it('lanza error si se intenta descifrar con clave incorrecta', () => {
    const encrypted = svc.encrypt('SECRET');
    const wrongEnv = { get: jest.fn().mockReturnValue('b'.repeat(64)) } as unknown as EnvService;
    const wrongSvc = new TotpEncryptionService(wrongEnv);
    expect(() => wrongSvc.decrypt(encrypted)).toThrow();
  });
});
