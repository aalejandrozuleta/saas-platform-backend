import { LoginContext } from './login-context.vo';

describe('LoginContext Value Object', () => {
  describe('create', () => {
    it('debería crear una instancia válida cuando se proporciona una IP', () => {
      const context = LoginContext.create({
        ip: '192.168.1.1',
      });

      expect(context).toBeInstanceOf(LoginContext);
      expect(context.ip).toBe('192.168.1.1');
      expect(context.country).toBeUndefined();
      expect(context.deviceFingerprint).toBeUndefined();
    });

    it('debería crear una instancia válida con todos los parámetros', () => {
      const context = LoginContext.create({
        ip: '192.168.1.1',
        country: 'CO',
        deviceFingerprint: 'device-123',
      });

      expect(context.ip).toBe('192.168.1.1');
      expect(context.country).toBe('CO');
      expect(context.deviceFingerprint).toBe('device-123');
    });

    it('debería lanzar error si la IP no es proporcionada', () => {
      expect(() =>
        LoginContext.create({
          ip: '' as unknown as string,
        }),
      ).toThrow('LOGIN_CONTEXT_IP_REQUIRED');
    });

    it('debería lanzar error si la IP es undefined', () => {
      expect(() =>
        LoginContext.create({
          ip: undefined as unknown as string,
        }),
      ).toThrow('LOGIN_CONTEXT_IP_REQUIRED');
    });
  });

  describe('toAuditMetadata', () => {
    it('debería convertir el contexto en metadata de auditoría', () => {
      const context = LoginContext.create({
        ip: '10.0.0.1',
        country: 'CL',
        deviceFingerprint: 'fingerprint-xyz',
      });

      const metadata = context.toAuditMetadata();

      expect(metadata).toEqual({
        ip: '10.0.0.1',
        country: 'CL',
        deviceFingerprint: 'fingerprint-xyz',
      });
    });

    it('debería incluir propiedades undefined si no se proporcionan', () => {
      const context = LoginContext.create({
        ip: '10.0.0.2',
      });

      const metadata = context.toAuditMetadata();

      expect(metadata).toEqual({
        ip: '10.0.0.2',
        country: undefined,
        deviceFingerprint: undefined,
      });
    });
  });
});