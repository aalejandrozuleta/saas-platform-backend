import { AddTrustedCountryUseCase } from './add-trusted-country.use-case';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { Test } from '@nestjs/testing';
import { ErrorCode } from '@saas/shared';

describe('AddTrustedCountryUseCase', () => {
  let useCase: AddTrustedCountryUseCase;
  let securityRepo: jest.Mocked<SecurityRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AddTrustedCountryUseCase,
        {
          provide: SECURITY_REPOSITORY,
          useValue: {
            getTrustedCountries: jest.fn(),
            addTrustedCountry: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(AddTrustedCountryUseCase);
    securityRepo = module.get(SECURITY_REPOSITORY);
  });

  it('adds country when list is empty', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue([]);
    securityRepo.addTrustedCountry.mockResolvedValue();

    await expect(useCase.execute('user-1', 'CO')).resolves.not.toThrow();
    expect(securityRepo.addTrustedCountry).toHaveBeenCalledWith('user-1', 'CO');
  });

  it('adds second country when list has one', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue(['CO']);
    securityRepo.addTrustedCountry.mockResolvedValue();

    await expect(useCase.execute('user-1', 'US')).resolves.not.toThrow();
  });

  it('throws TRUSTED_COUNTRY_ALREADY_EXISTS when country already in list', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue(['CO', 'US']);

    await expect(useCase.execute('user-1', 'CO')).rejects.toMatchObject({
      code: ErrorCode.TRUSTED_COUNTRY_ALREADY_EXISTS,
    });
    expect(securityRepo.addTrustedCountry).not.toHaveBeenCalled();
  });

  it('throws TRUSTED_COUNTRY_LIMIT_REACHED when list is full', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue(['CO', 'US']);

    await expect(useCase.execute('user-1', 'MX')).rejects.toMatchObject({
      code: ErrorCode.TRUSTED_COUNTRY_LIMIT_REACHED,
    });
    expect(securityRepo.addTrustedCountry).not.toHaveBeenCalled();
  });
});
