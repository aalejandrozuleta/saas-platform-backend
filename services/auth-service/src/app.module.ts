import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { AuditMongoModule } from '@infrastructure/audit/mongo/audit-mongo.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'services/auth-service/.env',
    }),
    EnvModule,
    MongoModule,
    AuditMongoModule,
    MetricsModule,
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
