import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { LoginAuditService } from '@application/audit/login-audit.service';

@Injectable()
export class AuthActivityListener {
  constructor(
    private readonly audit: LoginAuditService,
  ) {}

  @OnEvent(LoginAttemptedEvent.name)
  async handleAttempted(event: LoginAttemptedEvent) {
    await this.audit.loginAttempted(event.email, event.context);
  }

  @OnEvent(LoginSucceededEvent.name)
  async handleSucceeded(event: LoginSucceededEvent) {
    await this.audit.loginSucceeded(
      event.userId,
      event.context,
      event.sessionId,
    );
  }

  @OnEvent(LoginFailedEvent.name)
  async handleFailed(event: LoginFailedEvent) {
    await this.audit.loginFailed(
      event.userId,
      event.context,
      event.reason,
      event.email,
    );
  }

  @OnEvent(LoginBlockedEvent.name)
  async handleBlocked(event: LoginBlockedEvent) {
    await this.audit.loginBlocked(
      event.userId,
      event.context,
      event.blockedUntil,
    );
  }
}
