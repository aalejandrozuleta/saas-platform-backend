import { Module } from "@nestjs/common";
import { EnvModule } from "@config/env/env.module";
import { AuthProxy } from "@infrastructure/http/proxies/auth.proxy";
import { SharedModule } from "@saas/shared";

import { AuthController } from "./auth.controller";

@Module({
  imports: [EnvModule, SharedModule],
  controllers: [AuthController],
  providers: [AuthProxy],
  exports: [AuthProxy],
})
export class AuthModule {}
