import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService, successResponse } from '@saas/shared';
import { Request } from 'express';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { InviteMemberUseCase } from '@application/use-cases/company-membership/invite-member.use-case';
import { ListMembersUseCase } from '@application/use-cases/company-membership/list-members.use-case';
import { UpdateMemberUseCase } from '@application/use-cases/company-membership/update-member.use-case';
import { InviteMemberDto } from '@application/dto/company-membership/invite-member.dto';
import { UpdateMemberDto } from '@application/dto/company-membership/update-member.dto';
import { ListMembersQueryDto } from '@application/dto/company-membership/list-members-query.dto';
import { type CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import {
  InviteMemberSwagger,
  ListMembersSwagger,
  UpdateMemberSwagger,
} from '@infrastructure/swagger/company-membership.swagger';

/**
 * Controller de membresías (trabajadores de una empresa).
 */
@ApiTags('Company Members')
@Controller({ path: 'companies/:id/members', version: '1' })
@UseGuards(JwtAuthGuard)
export class CompanyMembershipController {
  constructor(
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly updateMemberUseCase: UpdateMemberUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @InviteMemberSwagger()
  async invite(
    @Param('id', new ParseUUIDPipe()) companyId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: Request,
  ) {
    const membership = await this.inviteMemberUseCase.execute(req.user!.id, companyId, dto);

    return successResponse(this.toResponse(membership), {
      message: this.i18n.translate('membership.invited_success', this.resolveLanguage(req)),
    });
  }

  @Get()
  @ListMembersSwagger()
  async list(
    @Param('id', new ParseUUIDPipe()) companyId: string,
    @Query() query: ListMembersQueryDto,
    @Req() req: Request,
  ) {
    const { items, total } = await this.listMembersUseCase.execute(req.user!.id, companyId, {
      page: query.page,
      limit: query.limit,
    });

    return successResponse({
      items: items.map((membership) => this.toResponse(membership)),
      page: query.page,
      limit: query.limit,
      total,
    });
  }

  @Patch(':membershipId')
  @UpdateMemberSwagger()
  async update(
    @Param('id', new ParseUUIDPipe()) companyId: string,
    @Param('membershipId', new ParseUUIDPipe()) membershipId: string,
    @Body() dto: UpdateMemberDto,
    @Req() req: Request,
  ) {
    const membership = await this.updateMemberUseCase.execute(
      req.user!.id,
      companyId,
      membershipId,
      dto,
    );

    return successResponse(this.toResponse(membership), {
      message: this.i18n.translate('membership.updated_success', this.resolveLanguage(req)),
    });
  }

  private toResponse(membership: CompanyMembership) {
    return {
      id: membership.id,
      companyId: membership.companyId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      createdAt: membership.createdAt,
    };
  }

  private resolveLanguage(req: Request): 'es' | 'en' {
    return this.i18n.resolveLanguage(req.get('accept-language')) as 'es' | 'en';
  }
}
