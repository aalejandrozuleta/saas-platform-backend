import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { AuditMongoModule } from '@infrastructure/audit/mongo/audit.module';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';
import { SqlModule } from '@infrastructure/persistence/sql/sql.module';
import { AuthModule } from '@modules/auth/auth.module';
import { HttpLoggerMiddleware } from '@infrastructure/logger/http-logger.middleware';
import { MongoModule } from '@infrastructure/persistence/mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'services/auth-service/.env',
    }),
    EnvModule,
    MongoModule,        
    AuditMongoModule,
    MetricsModule,
    SqlModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
