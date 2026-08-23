import { randomUUID } from 'node:crypto';

import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CompanyProxy } from '@infrastructure/http/proxies/company.proxy';
import {
  CreateCompanyGatewaySwagger,
  ListMyCompaniesGatewaySwagger,
  GetCompanyGatewaySwagger,
  UpdateCompanyGatewaySwagger,
  DeleteCompanyGatewaySwagger,
  InviteCompanyMemberGatewaySwagger,
  ListCompanyMembersGatewaySwagger,
  UpdateCompanyMemberGatewaySwagger,
  AcceptInvitationGatewaySwagger,
  DeclineInvitationGatewaySwagger,
  RemoveCompanyMemberGatewaySwagger,
  UploadCompanyLogoGatewaySwagger,
  RemoveCompanyLogoGatewaySwagger,
  RegisterWorkerGatewaySwagger,
} from '@infrastructure/swagger/company.swagger';

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

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

  @ListMyCompaniesGatewaySwagger()
  @Get()
  async listMine(@Req() req: Request) {
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

  @UpdateCompanyGatewaySwagger()
  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}`);
    return body;
  }

  @DeleteCompanyGatewaySwagger()
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}`);
    return body;
  }

  @UploadCompanyLogoGatewaySwagger()
  @Post(':id/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_LOGO_SIZE_BYTES },
    }),
  )
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forwardMultipart(req, `/companies/${id}/logo`, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    return body;
  }

  @RemoveCompanyLogoGatewaySwagger()
  @Delete(':id/logo')
  async removeLogo(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}/logo`);
    return body;
  }

  @RegisterWorkerGatewaySwagger()
  @Post(':id/workers')
  async registerWorker(@Req() req: Request, @Param('id') id: string) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(req, `/companies/${id}/workers`);
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

  @AcceptInvitationGatewaySwagger()
  @Post(':id/members/:membershipId/accept')
  async acceptInvitation(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
  ) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(
      req,
      `/companies/${id}/members/${membershipId}/accept`,
    );
    return body;
  }

  @DeclineInvitationGatewaySwagger()
  @Post(':id/members/:membershipId/decline')
  async declineInvitation(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
  ) {
    this.prepareRequest(req);
    const { body } = await this.companyProxy.forward(
      req,
      `/companies/${id}/members/${membershipId}/decline`,
    );
    return body;
  }

  @RemoveCompanyMemberGatewaySwagger()
  @Delete(':id/members/:membershipId')
  async removeMember(
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
