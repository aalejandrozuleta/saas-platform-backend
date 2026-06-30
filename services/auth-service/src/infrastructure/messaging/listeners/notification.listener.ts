import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '@application/events/user/user-registered.event';
import { PasswordChangedEvent } from '@application/events/password/password-changed.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { TwoFactorEnabledEvent } from '@application/events/two-factor/two-factor-enabled.event';
import { TwoFactorDisabledEvent } from '@application/events/two-factor/two-factor-disabled.event';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { NotificationClient } from '@infrastructure/notifications/notification.client';
import { EnvService } from '@config/env/env.service';

/**
 * Escucha eventos de dominio y envía emails vía notification-service.
 * Todos los envíos son fire-and-forget: un fallo aquí nunca
 * interrumpe el flujo principal de negocio.
 */
@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly notificationClient: NotificationClient,
    private readonly envService: EnvService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @OnEvent(UserRegisteredEvent.name)
  handleUserRegistered(event: UserRegisteredEvent): void {
    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    const appUrl = this.envService.get('APP_URL');
    const verificationUrl = `${appUrl}/verify-email?token=${event.verificationToken}`;
    this.notificationClient.sendEmail({
      to: event.email,
      subject: 'Activa tu cuenta Arlok',
      template: 'welcome',
      variables: {
        email: event.email,
        registeredAt: now,
        ip: event.context.ip,
        country: event.context.country ?? '—',
        verificationUrl,
      },
    });
  }

  @OnEvent(PasswordChangedEvent.name)
  async handlePasswordChanged(event: PasswordChangedEvent): Promise<void> {
    const email = await this.resolveEmail(event.userId);
    if (!email) return;

    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    this.notificationClient.sendEmail({
      to: email,
      subject: 'Alerta de seguridad — Contraseña cambiada',
      template: 'password-changed',
      variables: {
        email,
        changedAt: now,
        ip: event.context.ip,
        country: event.context.country ?? '—',
      },
    });
  }

  @OnEvent(LoginBlockedEvent.name)
  async handleLoginBlocked(event: LoginBlockedEvent): Promise<void> {
    const email = await this.resolveEmail(event.userId);
    if (!email) return;

    this.notificationClient.sendEmail({
      to: email,
      subject: 'Tu cuenta Arlok ha sido bloqueada temporalmente',
      template: 'account-locked',
      variables: {
        email,
        blockedUntil: event.blockedUntil
          ? event.blockedUntil.toLocaleString('es-CO', { timeZone: 'America/Bogota' })
          : 'Próximos 30 minutos',
        ip: event.context.ip,
        country: event.context.country ?? '—',
      },
    });
  }

  @OnEvent(TwoFactorEnabledEvent.name)
  async handleTwoFactorEnabled(event: TwoFactorEnabledEvent): Promise<void> {
    const email = await this.resolveEmail(event.userId);
    if (!email) return;

    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    this.notificationClient.sendEmail({
      to: email,
      subject: 'Verificación en dos pasos activada — Arlok',
      template: '2fa-enabled',
      variables: {
        email,
        enabledAt: now,
        ip: event.context.ip,
        country: event.context.country ?? '—',
      },
    });
  }

  @OnEvent(TwoFactorDisabledEvent.name)
  async handleTwoFactorDisabled(event: TwoFactorDisabledEvent): Promise<void> {
    const email = await this.resolveEmail(event.userId);
    if (!email) return;

    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    this.notificationClient.sendEmail({
      to: email,
      subject: 'Alerta — Verificación en dos pasos desactivada',
      template: '2fa-disabled',
      variables: {
        email,
        disabledAt: now,
        ip: event.context.ip,
        country: event.context.country ?? '—',
      },
    });
  }

  private async resolveEmail(userId: string): Promise<string | null> {
    try {
      const user = await this.userRepository.findById(userId);
      return user?.email.getValue() ?? null;
    } catch (err: unknown) {
      this.logger.warn(`No se pudo resolver email para userId=${userId}: ${(err as Error).message}`);
      return null;
    }
  }
}
