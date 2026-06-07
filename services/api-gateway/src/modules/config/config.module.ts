import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';
import { SharedModule } from '@saas/shared';
import { ConfigProxy } from '@infrastructure/http/proxies/config.proxy';
import { ConfigController } from './config.controller';

@Module({
  imports: [EnvModule, SharedModule],
  controllers: [ConfigController],
  providers: [ConfigProxy],
  exports: [ConfigProxy],
})
export class ConfigGatewayModule {}
