import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from '@saas/shared';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';
import { LookupUserByEmailUseCase } from '@application/use-cases/user/lookup-user-by-email.use-case';
import { ProvisionWorkerUseCase } from '@application/use-cases/user/provision-worker.use-case';
import { ProvisionWorkerDto } from '@application/dto/user/provision-worker.dto';

/**
 * Controller interno consumido por otros servicios de la plataforma
 * (hoy `company-service`, para resolver el `userId` de un email al
 * invitar workers, y para provisionar workers nuevos directamente).
 * Protegido con `InternalServiceGuard` — no pasa por el flujo normal de
 * sesión de usuario.
 */
@ApiTags('Internal')
@Controller({ path: 'users', version: '1' })
@UseGuards(InternalServiceGuard)
export class InternalUserController {
  constructor(
    private readonly lookupUserByEmailUseCase: LookupUserByEmailUseCase,
    private readonly provisionWorkerUseCase: ProvisionWorkerUseCase,
  ) {}

  @Get('lookup')
  async lookup(@Query('email') email: string) {
    const result = await this.lookupUserByEmailUseCase.execute(email);

    return successResponse(result);
  }

  @Post('provision')
  async provision(@Body() dto: ProvisionWorkerDto) {
    const result = await this.provisionWorkerUseCase.execute(dto);

    return successResponse(result);
  }
}
