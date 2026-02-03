import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthProxy } from "@infrastructure/http/auth.proxy";

@Module({
  controllers: [AuthController],
  providers: [AuthProxy],
  exports: [AuthProxy],
})
export class AuthModule {}
