import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { EnqueueEmailUseCase } from '../../application/use-cases/enqueue-email.use-case';
import { EnqueueWsUseCase } from '../../application/use-cases/enqueue-ws.use-case';
import { SendEmailDto } from '../../application/dtos/send-email.dto';
import { SendWsDto } from '../../application/dtos/send-ws.dto';

@ApiTags('Notifications')
@Controller('v1/notifications')
export class NotificationController {
  constructor(
    private readonly enqueueEmail: EnqueueEmailUseCase,
    private readonly enqueueWs: EnqueueWsUseCase,
  ) {}

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
}
