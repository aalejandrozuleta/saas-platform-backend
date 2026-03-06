import { Module } from "@nestjs/common";
import { AuthProxy } from "@infrastructure/http/auth.proxy";
import { EnvModule } from "@config/env/env.module";

import { AuthController } from "./auth.controller";

@Module({
  imports: [EnvModule],
  controllers: [AuthController],
  providers: [AuthProxy],
  exports: [AuthProxy],
})
export class AuthModule {}
