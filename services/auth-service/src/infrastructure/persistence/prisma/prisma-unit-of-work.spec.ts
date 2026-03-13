import { type Prisma } from '@prisma/client';

import { PrismaUnitOfWork } from './prisma-unit-of-work';
import { type PrismaService } from './prisma.service';

describe('PrismaUnitOfWork', () => {
  let unitOfWork: PrismaUnitOfWork;

  let prisma: {
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
    };

    unitOfWork = new PrismaUnitOfWork(
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe ejecutar el trabajo dentro de una transacción', async () => {
    const tx = {} as Prisma.TransactionClient;

    prisma.$transaction.mockImplementation(async (callback) => {
      return callback(tx);
    });

    const work = jest.fn().mockResolvedValue('result');

    const result = await unitOfWork.execute(work);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(work).toHaveBeenCalledWith(tx);
    expect(result).toBe('result');
  });

  it('debe retornar el resultado del work', async () => {
    const tx = {} as Prisma.TransactionClient;

    prisma.$transaction.mockImplementation(async (callback) => {
      return callback(tx);
    });

    const work = jest.fn().mockResolvedValue(123);

    const result = await unitOfWork.execute(work);

    expect(result).toBe(123);
  });

  it('debe propagar errores del work', async () => {
    const tx = {} as Prisma.TransactionClient;

    prisma.$transaction.mockImplementation(async (callback) => {
      return callback(tx);
    });

    const work = jest.fn().mockRejectedValue(
      new Error('transaction failed'),
    );

    await expect(unitOfWork.execute(work)).rejects.toThrow(
      'transaction failed',
    );
  });
});