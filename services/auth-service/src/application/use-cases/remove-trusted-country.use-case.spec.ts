import { RemoveTrustedCountryUseCase } from './remove-trusted-country.use-case';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { Test } from '@nestjs/testing';
import { ErrorCode } from '@saas/shared';

describe('RemoveTrustedCountryUseCase', () => {
  let useCase: RemoveTrustedCountryUseCase;
  let securityRepo: jest.Mocked<SecurityRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RemoveTrustedCountryUseCase,
        {
          provide: SECURITY_REPOSITORY,
          useValue: {
            getTrustedCountries: jest.fn(),
            removeTrustedCountry: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(RemoveTrustedCountryUseCase);
    securityRepo = module.get(SECURITY_REPOSITORY);
  });

  it('removes country that exists in list', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue(['CO', 'US']);
    securityRepo.removeTrustedCountry.mockResolvedValue();

    await expect(useCase.execute('user-1', 'CO')).resolves.not.toThrow();
    expect(securityRepo.removeTrustedCountry).toHaveBeenCalledWith('user-1', 'CO');
  });

  it('throws TRUSTED_COUNTRY_NOT_FOUND when country not in list', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue(['CO']);

    await expect(useCase.execute('user-1', 'MX')).rejects.toMatchObject({
      code: ErrorCode.TRUSTED_COUNTRY_NOT_FOUND,
    });
    expect(securityRepo.removeTrustedCountry).not.toHaveBeenCalled();
  });

  it('throws TRUSTED_COUNTRY_NOT_FOUND when list is empty', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue([]);

    await expect(useCase.execute('user-1', 'CO')).rejects.toMatchObject({
      code: ErrorCode.TRUSTED_COUNTRY_NOT_FOUND,
    });
  });
});
