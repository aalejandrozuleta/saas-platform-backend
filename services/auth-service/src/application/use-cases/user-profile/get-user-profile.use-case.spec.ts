import { ErrorCode } from '@saas/shared';

import { GetUserProfileUseCase } from './get-user-profile.use-case';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userProfileRepository: any;

  beforeEach(() => {
    userProfileRepository = { findByUserId: jest.fn() };
    useCase = new GetUserProfileUseCase(userProfileRepository);
  });

  it('debe devolver el perfil si existe', async () => {
    userProfileRepository.findByUserId.mockResolvedValue({ userId: 'user-1', firstName: 'Juan' });

    const profile = await useCase.execute('user-1');

    expect(profile).toEqual({ userId: 'user-1', firstName: 'Juan' });
  });

  it('debe lanzar USER_PROFILE_NOT_FOUND si no existe', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute('user-1')).rejects.toMatchObject({
      code: ErrorCode.USER_PROFILE_NOT_FOUND,
    });
  });
});
