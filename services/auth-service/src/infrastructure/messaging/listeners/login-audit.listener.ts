import { OnEvent } from '@nestjs/event-emitter';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { LoginAuditService } from '@application/audit/login-audit.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginSucceededAuditListener {
  constructor(
    private readonly audit: LoginAuditService,
  ) { }

  @OnEvent(LoginSucceededEvent.name)
  async handle(event: LoginSucceededEvent) {
    await this.audit.loginSucceeded(
      event.userId,
      event.context,
      event.sessionId,
    );
  }
}
