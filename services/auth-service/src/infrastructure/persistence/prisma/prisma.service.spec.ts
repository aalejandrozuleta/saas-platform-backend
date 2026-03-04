import { PrismaPg } from '@prisma/adapter-pg';
import { EnvService } from '@config/env/env.service';

import { PrismaService } from './prisma.service';


/**
 * Mock del Prisma Client generado
 * Se mockean únicamente los métodos usados por el servicio.
 */
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = jest.fn();
      $disconnect = jest.fn();
    },
  };
});

/**
 * Mock del adapter PostgreSQL
 */
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(),
}));

/**
 * Mock del EnvService
 */
jest.mock('@config/env/env.service', () => ({
  EnvService: class {
    get = jest.fn((key: string) => {
      if (key === 'DATABASE_URL') {
        return 'postgresql://test:test@localhost:5432/test';
      }
      return null;
    });
  },
}));

describe('PrismaService', () => {
  let service: PrismaService;
  let envService: EnvService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

    envService = new EnvService();
    service = new PrismaService(envService);
  });

  it('debe instanciar el adapter PrismaPg con la DATABASE_URL', () => {
    expect(PrismaPg).toHaveBeenCalledTimes(1);
    expect(PrismaPg).toHaveBeenCalledWith({
      connectionString: process.env.DATABASE_URL,
    });
  });

  it('debe llamar a $connect al inicializar el módulo', async () => {
    await service.onModuleInit();

    expect(service.$connect).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a $disconnect al destruir el módulo', async () => {
    await service.onModuleDestroy();

    expect(service.$disconnect).toHaveBeenCalledTimes(1);
  });
});
