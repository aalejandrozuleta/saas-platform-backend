import { ErrorCode } from '@saas/shared';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';

import { UpdateUserProfileUseCase } from './update-user-profile.use-case';

describe('UpdateUserProfileUseCase', () => {
  let useCase: UpdateUserProfileUseCase;
  let userProfileRepository: any;

  const existingProfile = UserProfile.create({
    userId: 'user-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    dataProcessingAcceptedAt: new Date('2026-01-01'),
    termsAcceptedAt: new Date('2026-01-01'),
  });

  beforeEach(() => {
    userProfileRepository = {
      findByUserId: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new UpdateUserProfileUseCase(userProfileRepository);
  });

  it('debe actualizar los campos provistos', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(existingProfile);

    const updated = await useCase.execute('user-1', { phone: '3001234567' });

    expect(updated.phone).toBe('3001234567');
    expect(userProfileRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '3001234567' }),
    );
  });

  it('debe lanzar USER_PROFILE_NOT_FOUND si el perfil no existe', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1', { phone: '3001234567' })).rejects.toMatchObject({
      code: ErrorCode.USER_PROFILE_NOT_FOUND,
    });

    expect(userProfileRepository.update).not.toHaveBeenCalled();
  });
});
