import { DocumentType } from '@domain/enums/document-type.enum';

import { UserProfile } from './user-profile.entity';

describe('UserProfile entity', () => {
  const baseProps = {
    userId: 'user-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    dataProcessingAcceptedAt: new Date('2026-01-01'),
    termsAcceptedAt: new Date('2026-01-01'),
  };

  describe('create', () => {
    it('debe crear un perfil con los valores proporcionados', () => {
      const profile = UserProfile.create(baseProps);

      expect(profile.userId).toBe('user-1');
      expect(profile.firstName).toBe('Juan');
      expect(profile.lastName).toBe('Pérez');
      expect(profile.phone).toBeUndefined();
      expect(profile.documentType).toBeUndefined();
    });

    it('debe setear createdAt/updatedAt automáticamente', () => {
      const before = new Date();
      const profile = UserProfile.create(baseProps);
      const after = new Date();

      expect(profile.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(profile.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(profile.updatedAt.getTime()).toEqual(profile.createdAt.getTime());
    });

    it('debe lanzar error si firstName está vacío', () => {
      expect(() => UserProfile.create({ ...baseProps, firstName: '  ' })).toThrow(
        'USER_PROFILE_FIRST_NAME_REQUIRED',
      );
    });

    it('debe lanzar error si lastName está vacío', () => {
      expect(() => UserProfile.create({ ...baseProps, lastName: '' })).toThrow(
        'USER_PROFILE_LAST_NAME_REQUIRED',
      );
    });

    it('debe lanzar error si no se aceptó el tratamiento de datos personales', () => {
      expect(() =>
        UserProfile.create({ ...baseProps, dataProcessingAcceptedAt: undefined as any }),
      ).toThrow('USER_PROFILE_DATA_PROCESSING_CONSENT_REQUIRED');
    });

    it('debe lanzar error si no se aceptaron los términos y condiciones', () => {
      expect(() => UserProfile.create({ ...baseProps, termsAcceptedAt: undefined as any })).toThrow(
        'USER_PROFILE_TERMS_CONSENT_REQUIRED',
      );
    });
  });

  describe('isCompleteForTransactions', () => {
    it('debe ser false si falta teléfono o documento', () => {
      const profile = UserProfile.create(baseProps);
      expect(profile.isCompleteForTransactions()).toBe(false);
    });

    it('debe ser true cuando tiene teléfono y documento completos', () => {
      const profile = UserProfile.create({
        ...baseProps,
        phone: '3001234567',
        documentType: DocumentType.CC,
        documentNumber: '123456789',
      });

      expect(profile.isCompleteForTransactions()).toBe(true);
    });
  });

  describe('updateContactInfo', () => {
    it('debe actualizar solo los campos provistos, manteniendo el resto', () => {
      const profile = UserProfile.create(baseProps);

      const updated = profile.updateContactInfo({ phone: '3001234567' });

      expect(updated.phone).toBe('3001234567');
      expect(updated.firstName).toBe('Juan');
      // inmutabilidad
      expect(profile.phone).toBeUndefined();
    });

    it('debe lanzar error si se intenta vaciar firstName', () => {
      const profile = UserProfile.create(baseProps);

      expect(() => profile.updateContactInfo({ firstName: '' })).toThrow(
        'USER_PROFILE_FIRST_NAME_REQUIRED',
      );
    });

    it('debe lanzar error si se intenta vaciar lastName', () => {
      const profile = UserProfile.create(baseProps);

      expect(() => profile.updateContactInfo({ lastName: '   ' })).toThrow(
        'USER_PROFILE_LAST_NAME_REQUIRED',
      );
    });

    it('debe actualizar updatedAt', () => {
      const profile = UserProfile.create(baseProps);
      const before = new Date();

      const updated = profile.updateContactInfo({ phone: '3001234567' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('updateAvatar', () => {
    it('debe reemplazar avatarUrl e inmutabilidad', () => {
      const profile = UserProfile.create(baseProps);
      const updated = profile.updateAvatar('https://storage.example.com/avatar.png');

      expect(updated.avatarUrl).toBe('https://storage.example.com/avatar.png');
      expect(profile.avatarUrl).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('debe reconstruir sin aplicar reglas de negocio', () => {
      const profile = UserProfile.fromPersistence({
        ...baseProps,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      expect(profile.userId).toBe('user-1');
    });
  });
});
