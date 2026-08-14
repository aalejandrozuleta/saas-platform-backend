import { DocumentType } from '@domain/enums/document-type.enum';

import { UserProfileMapper } from './user-profile.mapper';

describe('UserProfileMapper', () => {
  describe('toDomain', () => {
    it('debe mapear un registro Prisma a la entidad de dominio', () => {
      const profile = UserProfileMapper.toDomain({
        userId: 'user-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: null,
        documentType: null,
        documentNumber: null,
        avatarUrl: null,
        dataProcessingAcceptedAt: new Date('2026-01-01'),
        termsAcceptedAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      } as any);

      expect(profile.userId).toBe('user-1');
      expect(profile.phone).toBeUndefined();
      expect(profile.documentType).toBeUndefined();
    });

    it('debe preservar documentType/phone cuando vienen definidos', () => {
      const profile = UserProfileMapper.toDomain({
        userId: 'user-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '3001234567',
        documentType: DocumentType.CC,
        documentNumber: '123456789',
        avatarUrl: 'https://storage.example.com/avatar.png',
        dataProcessingAcceptedAt: new Date('2026-01-01'),
        termsAcceptedAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      } as any);

      expect(profile.phone).toBe('3001234567');
      expect(profile.documentType).toBe(DocumentType.CC);
      expect(profile.avatarUrl).toBe('https://storage.example.com/avatar.png');
    });
  });

  describe('toPersistence', () => {
    it('debe coercionar undefined a null para campos opcionales', () => {
      const { UserProfile } = jest.requireActual(
        '@domain/entities/user-profile/user-profile.entity',
      );
      const profile = UserProfile.create({
        userId: 'user-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        dataProcessingAcceptedAt: new Date('2026-01-01'),
        termsAcceptedAt: new Date('2026-01-01'),
      });

      const persistence = UserProfileMapper.toPersistence(profile);

      expect(persistence.phone).toBeNull();
      expect(persistence.documentType).toBeNull();
      expect(persistence.avatarUrl).toBeNull();
    });
  });
});
