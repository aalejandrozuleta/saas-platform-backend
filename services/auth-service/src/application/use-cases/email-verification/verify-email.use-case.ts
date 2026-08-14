import { Inject } from '@nestjs/common';
import { PLATFORM_LOGGER, PlatformLogger } from '@saas/shared';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: verificación del email del usuario mediante el token
 * enviado por correo tras el registro (o reenviado vía `resend-verification`).
 *
 * @remarks
 * El mismo error de dominio (`invalidVerificationToken`) se usa tanto para
 * token inexistente como para token expirado. Esto es intencional: no
 * queremos filtrar a un atacante si el problema es "el token no existe" vs
 * "el token existía pero venció", ya que esa distinción no le sirve a un
 * usuario legítimo (en ambos casos su única opción es pedir uno nuevo) pero
 * sí podría ayudar a enumerar tokens válidos.
 */
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {}

  /**
   * Ejecuta la verificación de email a partir del token recibido.
   *
   * @param token - Token de verificación enviado al correo del usuario.
   * @throws Error de dominio `invalidVerificationToken` si el token no
   * corresponde a ningún usuario o si ya expiró.
   */
  async execute(token: string): Promise<void> {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw DomainErrorFactory.invalidVerificationToken();
    }

    if (user.isEmailVerificationTokenExpired(new Date())) {
      throw DomainErrorFactory.invalidVerificationToken();
    }

    const verified = user.verifyEmail();
    await this.userRepository.update(verified);

    this.logger.info('Email verificado correctamente', { userId: user.id });
  }
}
