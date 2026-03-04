import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../persistence/prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Limpia tokens expirados cada hora.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanExpiredRefreshTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Limpia sesiones revocadas o finalizadas hace más de 30 días.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanOldSessions(): Promise<void> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    await this.prisma.session.deleteMany({
      where: {
        OR: [
          { revokedAt: { not: null } },
          { endedAt: { lt: threshold } },
        ],
      },
    });
  }
}