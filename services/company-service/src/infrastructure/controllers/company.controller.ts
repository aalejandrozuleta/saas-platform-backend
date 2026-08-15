import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService, successResponse } from '@saas/shared';
import { Request } from 'express';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CreateCompanyUseCase } from '@application/use-cases/company/create-company.use-case';
import { GetCompanyUseCase } from '@application/use-cases/company/get-company.use-case';
import { CreateCompanyDto } from '@application/dto/company/create-company.dto';
import { type Company } from '@domain/entities/company/company.entity';
import { CreateCompanySwagger, GetCompanySwagger } from '@infrastructure/swagger/company.swagger';

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

  @Get(':id')
  @GetCompanySwagger()
  async get(@Param('id') id: string, @Req() req: Request) {
    const company = await this.getCompanyUseCase.execute(req.user!.id, id);

    return successResponse(this.toResponse(company));
  }

  private toResponse(company: Company) {
    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId,
      plan: company.plan,
      subscriptionStatus: company.subscriptionStatus,
      createdAt: company.createdAt,
    };
  }

  private resolveLanguage(req: Request): 'es' | 'en' {
    return this.i18n.resolveLanguage(req.get('accept-language')) as 'es' | 'en';
  }
}
