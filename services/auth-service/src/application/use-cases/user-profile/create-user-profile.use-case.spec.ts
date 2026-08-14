import { ErrorCode } from '@saas/shared';

import { CreateUserProfileUseCase } from './create-user-profile.use-case';

describe('CreateUserProfileUseCase', () => {
  let useCase: CreateUserProfileUseCase;
  let userProfileRepository: any;

  beforeEach(() => {
    userProfileRepository = {
      findByUserId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new CreateUserProfileUseCase(userProfileRepository);
  });

  it('debe crear el perfil si el usuario no tiene uno', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(null);

    const profile = await useCase.execute('user-1', {
      firstName: 'Juan',
      lastName: 'Pérez',
      dataProcessingAccepted: true,
      termsAccepted: true,
    });

    expect(profile.firstName).toBe('Juan');
    expect(profile.userId).toBe('user-1');
    expect(userProfileRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
    );
  });

  it('debe lanzar USER_PROFILE_ALREADY_EXISTS si ya existe un perfil', async () => {
    userProfileRepository.findByUserId.mockResolvedValue({ userId: 'user-1' });

    await expect(
      useCase.execute('user-1', {
        firstName: 'Juan',
        lastName: 'Pérez',
        dataProcessingAccepted: true,
        termsAccepted: true,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.USER_PROFILE_ALREADY_EXISTS });

    expect(userProfileRepository.save).not.toHaveBeenCalled();
  });
});
