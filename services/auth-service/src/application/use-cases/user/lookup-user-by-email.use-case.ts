import { Inject } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { EmailVO } from '@domain/value-objects/email.vo';

/**
 * Caso de uso: resuelve el `userId` de un usuario a partir de su email.
 *
 * @remarks
 * Usado por el endpoint interno `GET /v1/users/lookup`
 * (`InternalUserController`), consumido por otros servicios de la
 * plataforma — hoy `company-service`, al invitar workers por email — que
 * no tienen acceso directo a la tabla `User` de `auth-service`.
 */
export class LookupUserByEmailUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: UserRepository) {}

  async execute(email: string): Promise<{ userId: string; email: string }> {
    const emailVO = EmailVO.create(email);
    const user = await this.userRepo.findByEmail(emailVO);

    if (!user) {
      throw DomainErrorFactory.userNotFound();
    }

    return { userId: user.id, email: user.email.getValue() };
  }
}
