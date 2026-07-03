import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PublicRoute } from '@saas/shared';

import { EnqueueEmailUseCase } from '../../application/use-cases/enqueue-email.use-case';
import { EnqueueWsUseCase } from '../../application/use-cases/enqueue-ws.use-case';
import { SendEmailDto } from '../../application/dtos/send-email.dto';
import { SendWsDto } from '../../application/dtos/send-ws.dto';
import { TemplateEngine } from '../templates/template.engine';

const PREVIEW_DEFAULTS: Record<string, Record<string, string>> = {
  welcome: {
    email: 'ana.garcia@empresa.com',
    registeredAt: '30 jun 2026, 10:35 a. m.',
    ip: '203.0.113.10',
    country: 'Colombia',
  },
  'password-changed': {
    email: 'ana.garcia@empresa.com',
    changedAt: '30 jun 2026, 10:35 a. m.',
    ip: '203.0.113.10',
    country: 'Colombia',
  },
  '2fa-enabled': {
    email: 'ana.garcia@empresa.com',
    enabledAt: '30 jun 2026, 10:35 a. m.',
    ip: '203.0.113.10',
    country: 'Colombia',
  },
  '2fa-disabled': {
    email: 'ana.garcia@empresa.com',
    disabledAt: '30 jun 2026, 10:35 a. m.',
    ip: '203.0.113.10',
    country: 'Colombia',
  },
  'account-locked': {
    blockedUntil: '30 jun 2026, 11:05 a. m.',
    ip: '198.51.100.24',
    country: 'Venezuela',
  },
  maintenance: {
    message:
      'Realizaremos una actualización de infraestructura para mejorar el rendimiento de la plataforma.',
    scheduledAt: '1 jul 2026, 2:00 a. m.',
    duration: '2 horas',
  },
  'otp-code': { code: '847 293', expiresIn: '10' },
};

/**
 * Controller HTTP del dominio de notificaciones.
 *
 * @remarks
 * Los endpoints `POST /email` y `POST /ws` son de disparo asíncrono: solo
 * encolan el job (ver `EnqueueEmailUseCase` / `EnqueueWsUseCase`) y
 * responden `202 Accepted` de inmediato, sin esperar a que el email se
 * envíe o la notificación WS llegue al cliente. Todas las rutas están
 * protegidas por `InternalServiceGuard` salvo las marcadas `@PublicRoute()`
 * (los previews de templates, pensados para revisión visual en development).
 */
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly enqueueEmail: EnqueueEmailUseCase,
    private readonly enqueueWs: EnqueueWsUseCase,
    private readonly templateEngine: TemplateEngine,
  ) {}

  /** Encola un email transaccional; responde 202 sin esperar el envío real. */
  @Post('email')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Encola un email para envío asíncrono con Resend' })
  async sendEmail(@Body() dto: SendEmailDto): Promise<{ queued: true }> {
    await this.enqueueEmail.execute({
      to: dto.to,
      subject: dto.subject,
      template: dto.template,
      variables: dto.variables,
    });
    return { queued: true };
  }

  /**
   * Encola una notificación WebSocket. `SendWsDto` no valida a nivel de
   * clase que `userId` venga presente cuando `target === 'user'`; ese caso
   * se resuelve aquí con `!` y, si `userId` faltara, terminaría fallando
   * más abajo en `WsConsumer.process`. Este método solo traduce el DTO al
   * `WsTarget` del dominio.
   */
  @Post('ws')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Encola una notificación WebSocket (broadcast o usuario específico)' })
  async sendWs(@Body() dto: SendWsDto): Promise<{ queued: true }> {
    await this.enqueueWs.execute({
      event: dto.event,
      target: dto.target === 'broadcast' ? 'broadcast' : { userId: dto.userId! },
      data: dto.data,
    });
    return { queued: true };
  }

  /** Lista, en HTML, todos los templates registrados en `TemplateEngine` con link a su preview. Ruta pública, solo para uso en development. */
  @Get('preview')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: 'Lista todos los templates disponibles con links de preview' })
  @PublicRoute()
  listPreviews(): string {
    const templates = this.templateEngine.list();
    const links = templates
      .map(
        (t) =>
          `<li style="margin:12px 0"><a href="/notifications/v1/notifications/preview/${t}" style="color:#6b7af7;font-size:15px;text-decoration:none;font-weight:500">${t}</a></li>`,
      )
      .join('');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Arlok — Email Previews</title><style>body{background:#0a0a0a;color:#e8e8e8;font-family:Inter,sans-serif;padding:40px}h1{color:#fff;font-size:20px;margin-bottom:24px}ul{list-style:none;padding:0}a:hover{text-decoration:underline!important}</style></head><body><h1>Arl<span style="color:#6b7af7">ok</span> · Email Templates</h1><ul>${links}</ul></body></html>`;
  }

  /**
   * Renderiza un template con datos de ejemplo (`PREVIEW_DEFAULTS`) y los
   * query params recibidos como overrides. Ruta pública, solo para uso en
   * development.
   *
   * @remarks
   * `WelcomeEmail` sanea el `verificationUrl` (solo permite http/https) para
   * evitar que un query param malicioso inyecte un href `javascript:` en el
   * HTML renderizado, dado que esta ruta pasa query params directo a las
   * variables del template.
   */
  @Get('preview/:template')
  @ApiOperation({ summary: 'Preview de un template de email en el browser' })
  @ApiParam({ name: 'template', example: 'welcome' })
  @ApiQuery({ name: 'email', required: false, example: 'usuario@empresa.com' })
  @PublicRoute()
  async previewTemplate(
    @Param('template') template: string,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ): Promise<void> {
    const available = this.templateEngine.list();
    if (!available.includes(template)) {
      throw new NotFoundException(
        `Template '${template}' no encontrado. Disponibles: ${available.join(', ')}`,
      );
    }

    const defaults = PREVIEW_DEFAULTS[template] ?? {};
    const variables = { ...defaults, ...query };

    const html = await this.templateEngine.render(template, variables);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
