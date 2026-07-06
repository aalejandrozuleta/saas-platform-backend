import { randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { DOMAIN_EVENT_BUS } from '@domain/token/services.tokens';
import { PasswordResetRequestedEvent } from '@application/events/password/password-reset-requested.event';
import { EnvService } from '@config/env/env.service';
import { EmailVO } from '@domain/value-objects/email.vo';

/**
 * Caso de uso: solicitar recuperación de contraseña ("olvidé mi contraseña").
 *
 * @remarks
 * Responsabilidades:
 *  1. Genera un token de recuperación con TTL configurable
 *     (`PASSWORD_RESET_TTL`), invalidando cualquier token anterior.
 *  2. Emite `PasswordResetRequestedEvent` → listener desacoplado envía
 *     el correo con el enlace de recuperación.
 *
 * Si no existe un usuario con ese email, la operación termina en silencio
 * (no lanza error) para evitar enumeración de cuentas registradas.
 */
@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_BUS) private readonly eventBus: DomainEventBus,
    private readonly envService: EnvService,
  ) {}

  /**
   * Ejecuta la solicitud de recuperación de contraseña.
   *
   * @param email - Email de la cuenta que solicita la recuperación.
   */
  async execute(email: string): Promise<void> {
    const emailVO = EmailVO.create(email);
    const user = await this.userRepository.findByEmail(emailVO);

    // Sin usuario → respuesta silenciosa para no revelar existencia de cuentas
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const ttlSeconds = this.envService.get('PASSWORD_RESET_TTL');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const updated = user.requestPasswordReset(token, expiresAt);
    await this.userRepository.update(updated);

    this.eventBus.publish(new PasswordResetRequestedEvent(email, token));
  }
}
