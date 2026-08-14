import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';

import { UserProfilePrismaRepository } from './user-profile.prisma.repository';
import { type PrismaService } from './prisma.service';

describe('UserProfilePrismaRepository', () => {
  let repository: UserProfilePrismaRepository;
  let prisma: any;

  const persistedRow = {
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
  };

  beforeEach(() => {
    prisma = {
      userProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    repository = new UserProfilePrismaRepository(prisma as PrismaService);
  });

  describe('findByUserId', () => {
    it('debe devolver el perfil mapeado a dominio si existe', async () => {
      prisma.userProfile.findUnique.mockResolvedValue(persistedRow);

      const profile = await repository.findByUserId('user-1');

      expect(profile).not.toBeNull();
      expect(profile!.firstName).toBe('Juan');
      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('debe devolver null si no existe', async () => {
      prisma.userProfile.findUnique.mockResolvedValue(null);

      const profile = await repository.findByUserId('user-1');

      expect(profile).toBeNull();
    });
  });

  describe('save', () => {
    it('debe crear el registro', async () => {
      const profile = UserProfile.create({
        userId: 'user-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        dataProcessingAcceptedAt: new Date('2026-01-01'),
        termsAcceptedAt: new Date('2026-01-01'),
      });

      await repository.save(profile);

      expect(prisma.userProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1' }) }),
      );
    });
  });

  describe('update', () => {
    it('debe actualizar el registro por userId', async () => {
      const profile = UserProfile.fromPersistence({
        userId: 'user-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        dataProcessingAcceptedAt: new Date('2026-01-01'),
        termsAcceptedAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      await repository.update(profile);

      expect(prisma.userProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });
});
