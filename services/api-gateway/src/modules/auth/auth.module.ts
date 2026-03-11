import { Module } from "@nestjs/common";
import { EnvModule } from "@config/env/env.module";
import { AuthProxy } from "@infrastructure/http/proxies/auth.proxy";

import { AuthController } from "./auth.controller";

@Module({
  imports: [EnvModule],
  controllers: [AuthController],
  providers: [AuthProxy],
  exports: [AuthProxy],
})
export class AuthModule {}
