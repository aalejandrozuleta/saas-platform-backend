import { randomUUID } from 'node:crypto';

import { Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CompanyProxy } from '@infrastructure/http/proxies/company.proxy';
import {
  CreateCompanyGatewaySwagger,
  GetCompanyGatewaySwagger,
  InviteCompanyMemberGatewaySwagger,
  ListCompanyMembersGatewaySwagger,
  UpdateCompanyMemberGatewaySwagger,
} from '@infrastructure/swagger/company.swagger';

/**
 * Controller de Compañías/Membresías en el API Gateway.
 *
 * @remarks
 * Reenvía todo hacia company-service vía `CompanyProxy`. Protegido por el
 * `JwtSessionGuard` global (ver `AppModule`) igual que el resto de rutas no
 * marcadas `@PublicRoute()` — company-service vuelve a validar el JWT
 * (defensa en profundidad, mismo patrón ya usado por auth-service).
 */
@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyProxy: CompanyProxy) {}

  @CreateCompanyGatewaySwagger()
  @Post()
  async create(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, '/companies');
    return body;
  }

  @GetCompanyGatewaySwagger()
  @Get(':id')
  async get(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}`);
    return body;
  }

  @InviteCompanyMemberGatewaySwagger()
  @Post(':id/members')
  async inviteMember(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}/members`);
    return body;
  }

  @ListCompanyMembersGatewaySwagger()
  @Get(':id/members')
  async listMembers(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}/members`);
    return body;
  }

  @UpdateCompanyMemberGatewaySwagger()
  @Patch(':id/members/:membershipId')
  async updateMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
  ) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(
      req,
      `/companies/${id}/members/${membershipId}`,
    );
    return body;
  }

  /**
   * Prepara headers comunes antes de reenviar la request.
   */
  private prepareRequest(req: Request): void {
    req.headers['x-correlation-id'] ??= randomUUID();
    req.headers['accept-language'] ??= 'es';
  }
}
