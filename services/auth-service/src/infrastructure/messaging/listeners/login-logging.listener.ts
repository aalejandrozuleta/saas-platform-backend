import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { PLATFORM_LOGGER, PlatformLogger } from '@saas/shared';

/**
 * Listener encargado de registrar logs técnicos
 * cuando un login es exitoso.
 */
@Injectable()
export class LoginLoggingListener {
  constructor(
    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) { }

  /**
   * Maneja el evento de login exitoso
   */
  @OnEvent(LoginSucceededEvent.name)
  handle(event: LoginSucceededEvent): void {
    this.logger.info('Login succeeded', {
      userId: event.userId,
      ip: event.context.ip,
      sessionId: event.sessionId,
    });
  }
}
