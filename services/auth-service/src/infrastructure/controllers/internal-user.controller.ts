import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from '@saas/shared';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';
import { LookupUserByEmailUseCase } from '@application/use-cases/user/lookup-user-by-email.use-case';

/**
 * Controller interno consumido por otros servicios de la plataforma
 * (hoy `company-service`, para resolver el `userId` de un email al
 * invitar workers). Protegido con `InternalServiceGuard` — no pasa por el
 * flujo normal de sesión de usuario.
 */
@ApiTags('Internal')
@Controller({ path: 'users', version: '1' })
@UseGuards(InternalServiceGuard)
export class InternalUserController {
  constructor(private readonly lookupUserByEmailUseCase: LookupUserByEmailUseCase) {}

  @Get('lookup')
  async lookup(@Query('email') email: string) {
    const result = await this.lookupUserByEmailUseCase.execute(email);

    return successResponse(result);
  }
}
