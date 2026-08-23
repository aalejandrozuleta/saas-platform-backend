import { memoryStorage } from 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { I18nService, successResponse } from '@saas/shared';
import { Request } from 'express';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CreateCompanyUseCase } from '@application/use-cases/company/create-company.use-case';
import { GetCompanyUseCase } from '@application/use-cases/company/get-company.use-case';
import { UpdateCompanyUseCase } from '@application/use-cases/company/update-company.use-case';
import { DeleteCompanyUseCase } from '@application/use-cases/company/delete-company.use-case';
import {
  ListMyCompaniesUseCase,
  type MyCompanyMembership,
} from '@application/use-cases/company/list-my-companies.use-case';
import { UploadCompanyLogoUseCase } from '@application/use-cases/company/upload-company-logo.use-case';
import { RemoveCompanyLogoUseCase } from '@application/use-cases/company/remove-company-logo.use-case';
import { RegisterWorkerUseCase } from '@application/use-cases/company-membership/register-worker.use-case';
import { CreateCompanyDto } from '@application/dto/company/create-company.dto';
import { UpdateCompanyDto } from '@application/dto/company/update-company.dto';
import { RegisterWorkerDto } from '@application/dto/company-membership/register-worker.dto';
import { type Company } from '@domain/entities/company/company.entity';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import {
  CreateCompanySwagger,
  GetCompanySwagger,
  UpdateCompanySwagger,
  DeleteCompanySwagger,
  ListMyCompaniesSwagger,
  UploadCompanyLogoSwagger,
  RemoveCompanyLogoSwagger,
} from '@infrastructure/swagger/company.swagger';
import { RegisterWorkerSwagger } from '@infrastructure/swagger/company-membership.swagger';

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Controller de empresas (tenant).
 */
@ApiTags('Companies')
@Controller({ path: 'companies', version: '1' })
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly listMyCompaniesUseCase: ListMyCompaniesUseCase,
    private readonly uploadCompanyLogoUseCase: UploadCompanyLogoUseCase,
    private readonly removeCompanyLogoUseCase: RemoveCompanyLogoUseCase,
    private readonly registerWorkerUseCase: RegisterWorkerUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @CreateCompanySwagger()
  async create(@Body() dto: CreateCompanyDto, @Req() req: Request) {
    const company = await this.createCompanyUseCase.execute(req.user!.id, dto);

    return successResponse(this.toResponse(company), {
      message: this.i18n.translate('company.created_success', this.resolveLanguage(req)),
    });
  }

  @Get()
  @ListMyCompaniesSwagger()
  async listMine(@Req() req: Request) {
    const rows = await this.listMyCompaniesUseCase.execute(req.user!.id);

    return successResponse(rows.map((row) => this.toMyCompanyResponse(row)));
  }

  @Get(':id')
  @GetCompanySwagger()
  async get(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    const company = await this.getCompanyUseCase.execute(req.user!.id, id);

    return successResponse(this.toResponse(company));
  }

  @Patch(':id')
  @UpdateCompanySwagger()
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
    @Req() req: Request,
  ) {
    const company = await this.updateCompanyUseCase.execute(req.user!.id, id, dto);

    return successResponse(this.toResponse(company), {
      message: this.i18n.translate('company.updated_success', this.resolveLanguage(req)),
    });
  }

  @Delete(':id')
  @DeleteCompanySwagger()
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    await this.deleteCompanyUseCase.execute(req.user!.id, id);

    return successResponse(
      {},
      { message: this.i18n.translate('company.deleted_success', this.resolveLanguage(req)) },
    );
  }

  @Post(':id/logo')
  @UploadCompanyLogoSwagger()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_LOGO_SIZE_BYTES },
    }),
  )
  async uploadLogo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw DomainErrorFactory.logoFileRequired();
    }

    const company = await this.uploadCompanyLogoUseCase.execute(req.user!.id, id, {
      buffer: file.buffer,
    });

    return successResponse(this.toResponse(company), {
      message: this.i18n.translate('company.logo_updated_success', this.resolveLanguage(req)),
    });
  }

  @Delete(':id/logo')
  @RemoveCompanyLogoSwagger()
  async removeLogo(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    const company = await this.removeCompanyLogoUseCase.execute(req.user!.id, id);

    return successResponse(this.toResponse(company), {
      message: this.i18n.translate('company.logo_removed_success', this.resolveLanguage(req)),
    });
  }

  @Post(':id/workers')
  @RegisterWorkerSwagger()
  async registerWorker(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RegisterWorkerDto,
    @Req() req: Request,
  ) {
    const { membership, loginEmail } = await this.registerWorkerUseCase.execute(
      req.user!.id,
      id,
      dto,
    );

    return successResponse(
      { ...this.toMembershipResponse(membership), loginEmail },
      {
        message: this.i18n.translate(
          'membership.worker_registered_success',
          this.resolveLanguage(req),
        ),
      },
    );
  }

  private toMembershipResponse(membership: CompanyMembership) {
    return {
      id: membership.id,
      companyId: membership.companyId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      createdAt: membership.createdAt,
    };
  }

  private toMyCompanyResponse(row: MyCompanyMembership) {
    return {
      membershipId: row.membershipId,
      role: row.role,
      status: row.status,
      company: this.toResponse(row.company),
    };
  }

  private toResponse(company: Company) {
    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId,
      email: company.email,
      phone: company.phone,
      address: company.address,
      city: company.city,
      country: company.country,
      logoUrl: company.logoUrl,
      plan: company.plan,
      subscriptionStatus: company.subscriptionStatus,
      createdAt: company.createdAt,
    };
  }

  private resolveLanguage(req: Request): 'es' | 'en' {
    return this.i18n.resolveLanguage(req.get('accept-language')) as 'es' | 'en';
  }
}
