import { Module } from "@nestjs/common";
import { AuthProxy } from "@infrastructure/http/auth.proxy";

import { AuthController } from "./auth.controller";

@Module({
  controllers: [AuthController],
  providers: [AuthProxy],
  exports: [AuthProxy],
})
export class AuthModule {}
