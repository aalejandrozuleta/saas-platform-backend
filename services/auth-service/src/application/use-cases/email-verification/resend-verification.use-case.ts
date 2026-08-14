import { randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { DOMAIN_EVENT_BUS } from '@domain/token/services.tokens';
import { VerificationEmailRequestedEvent } from '@application/events/user/verification-email-requested.event';
import { EnvService } from '@config/env/env.service';
import { EmailVO } from '@domain/value-objects/email.vo';

/**
 * Caso de uso: reenviar el correo de verificación de email.
 *
 * @remarks
 * Responsabilidades:
 *  1. Genera un nuevo token de verificación con TTL configurable
 *     (`EMAIL_VERIFICATION_TTL`), invalidando el anterior.
 *  2. Emite `VerificationEmailRequestedEvent` → listener desacoplado envía
 *     el correo.
 *
 * Si no existe un usuario con ese email, la operación termina en silencio
 * (no lanza error) para evitar enumeración de cuentas registradas. Si el
 * email ya fue verificado, sí se lanza un error de dominio, ya que en ese
 * caso no hay riesgo de enumeración (la existencia del usuario ya quedó
 * implícita en el flujo previo de registro/login).
 */
@Injectable()
export class ResendVerificationUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(DOMAIN_EVENT_BUS) private readonly eventBus: DomainEventBus,
    private readonly envService: EnvService,
  ) {}

  /**
   * Ejecuta el reenvío del correo de verificación.
   *
   * @param email - Email del usuario que solicita el reenvío
   * @throws Error de dominio si el email del usuario ya fue verificado
   */
  async execute(email: string): Promise<void> {
    const emailVO = EmailVO.create(email);
    const user = await this.userRepository.findByEmail(emailVO);

    // Sin usuario → respuesta silenciosa para no revelar existencia de cuentas
    if (!user) return;

    if (user.emailVerified) {
      throw DomainErrorFactory.emailAlreadyVerified();
    }

    const token = randomBytes(32).toString('hex');
    const ttlSeconds = this.envService.get('EMAIL_VERIFICATION_TTL');
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const updated = user.requestVerification(token, expiresAt);
    await this.userRepository.update(updated);

    this.eventBus.publish(new VerificationEmailRequestedEvent(email, token));
  }
}
