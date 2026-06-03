import { Device } from './device.entity';

describe('Device entity', () => {
  const baseProps = {
    id: 'device-1',
    userId: 'user-1',
    fingerprint: 'fp-abc',
    ipAddress: '127.0.0.1',
    country: 'CO',
    isTrusted: false,
    createdAt: new Date(),
  };

  describe('create', () => {
    it('debe crear un dispositivo con los valores proporcionados', () => {
      const device = Device.create(baseProps);

      expect(device.id).toBe('device-1');
      expect(device.userId).toBe('user-1');
      expect(device.fingerprint).toBe('fp-abc');
      expect(device.ipAddress).toBe('127.0.0.1');
      expect(device.isTrusted).toBe(false);
    });

    it('debe usar isTrusted=false por defecto si no se proporciona', () => {
      const props = { ...baseProps } as any;
      delete props.isTrusted;
      const device = Device.create(props);
      expect(device.isTrusted).toBe(false);
    });

    it('debe usar new Date() por defecto si createdAt no se proporciona', () => {
      const props = { ...baseProps } as any;
      delete props.createdAt;
      const before = new Date();
      const device = Device.create(props);
      const after = new Date();
      expect(device.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(device.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('debe lanzar error si el fingerprint está vacío', () => {
      expect(() =>
        Device.create({ ...baseProps, fingerprint: '' }),
      ).toThrow('DEVICE_FINGERPRINT_REQUIRED');
    });
  });

  describe('markAsTrusted', () => {
    it('debe retornar un nuevo Device con isTrusted = true', () => {
      const device = Device.fromPersistence({ ...baseProps, isTrusted: false });
      const trusted = device.markAsTrusted();

      expect(trusted.isTrusted).toBe(true);
      // inmutabilidad
      expect(device.isTrusted).toBe(false);
    });
  });

  describe('updateLastUsed', () => {
    it('debe retornar un nuevo Device con lastUsedAt actualizado', () => {
      const device = Device.fromPersistence({
        ...baseProps,
        lastUsedAt: undefined,
      });

      const before = new Date();
      const updated = device.updateLastUsed();
      const after = new Date();

      expect(updated.lastUsedAt).toBeDefined();
      expect(updated.lastUsedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(updated.lastUsedAt!.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );

      // inmutabilidad
      expect(device.lastUsedAt).toBeUndefined();
    });
  });
});
