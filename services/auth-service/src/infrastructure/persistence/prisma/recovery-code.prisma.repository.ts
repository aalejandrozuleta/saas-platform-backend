import { Injectable } from '@nestjs/common';
import { RecoveryCodeRepository } from '@application/ports/recovery-code.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class RecoveryCodePrismaRepository implements RecoveryCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(userId: string, codeHashes: string[]): Promise<void> {
    await this.prisma.recoveryCode.createMany({
      data: codeHashes.map((codeHash) => ({ userId, codeHash })),
    });
  }

  async deleteAllByUser(userId: string): Promise<void> {
    await this.prisma.recoveryCode.deleteMany({ where: { userId } });
  }
}
