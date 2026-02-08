import { randomUUID } from 'crypto';

import { UserRepository } from '@domain/repositories/user.repository';
import { EmailVO } from '@domain/value-objects/email.vo';
import { PasswordVO } from '@domain/value-objects/password.vo';
import { User } from '@domain/entities/user.entity';
import { EmailAlreadyExistsError } from '@domain/errors/email-already-exists.error';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/token/user-repository.token';

/**
 * Caso de uso para registrar usuario
 */
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const emailVO = EmailVO.create(email);
    const passwordVO = PasswordVO.create(password);

    const exists = await this.userRepository.findByEmail(emailVO);
    if (exists) {
      throw new EmailAlreadyExistsError();
    }

    const hash = await this.passwordHasher.hash(passwordVO.getValue());

    const user = User.create({
      id: randomUUID(),
      email: emailVO,
      passwordHash: hash,
    });

    await this.userRepository.save(user);

    return user;
  }
}
