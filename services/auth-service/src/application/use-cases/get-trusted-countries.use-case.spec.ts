import { GetTrustedCountriesUseCase } from './get-trusted-countries.use-case';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { Test } from '@nestjs/testing';

describe('GetTrustedCountriesUseCase', () => {
  let useCase: GetTrustedCountriesUseCase;
  let securityRepo: jest.Mocked<SecurityRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GetTrustedCountriesUseCase,
        {
          provide: SECURITY_REPOSITORY,
          useValue: { getTrustedCountries: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(GetTrustedCountriesUseCase);
    securityRepo = module.get(SECURITY_REPOSITORY);
  });

  it('returns list of countries', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue(['CO', 'US']);
    const result = await useCase.execute('user-1');
    expect(result).toEqual({ countries: ['CO', 'US'] });
  });

  it('returns empty array when no countries registered', async () => {
    securityRepo.getTrustedCountries.mockResolvedValue([]);
    const result = await useCase.execute('user-1');
    expect(result).toEqual({ countries: [] });
  });
});
