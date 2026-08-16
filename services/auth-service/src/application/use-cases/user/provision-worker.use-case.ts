import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';
import { User } from '@domain/entities/user/user.entity';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { UserRole } from '@domain/enums/user-role.enum';
import { UserStatus } from '@domain/enums/user-status.enum';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserRepository } from '@domain/repositories/user.repository';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { USER_REPOSITORY, USER_PROFILE_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, UNIT_OF_WORK, DOMAIN_EVENT_BUS } from '@domain/token/services.tokens';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { WorkerProvisionedEvent } from '@application/events/user/worker-provisioned.event';
import { generateWorkerLoginEmail } from '@application/services/worker-login-email-generator';
import { generateTempPassword } from '@application/services/temp-password-generator';

/**
 * Caso de uso: una empresa registra un worker directamente, sin que el
 * worker se haya autoregistrado.
 *
 * @remarks
 * Genera un email de login "fake pero único" (no se envía correo ahí, solo
 * sirve como credencial) y una contraseña temporal aleatoria. Crea `User` +
 * `UserProfile` y marca `mustChangePassword: true`, de modo que el primer
 * login del worker quede bloqueado hasta que complete
 * `CompleteFirstLoginUseCase` (cambio de contraseña + aceptación de
 * consentimiento + login, todo en una sola llamada).
 *
 * Las credenciales reales (login email + contraseña temporal) se envían al
 * `contactEmail` de la empresa vía `WorkerProvisionedEvent` — nunca se
 * retornan ni se loguean en texto plano.
 *
 * @remarks Nota de transaccionalidad
 * `UserRepository`/`UserProfileRepository` no aceptan un `tx` de
 * `Prisma.TransactionClient` en sus métodos `save()` (a diferencia de
 * `DeviceRepository`/`SessionRepository`, que sí lo aceptan). Ampliar esas
 * interfaces está fuera del alcance de este cambio, así que la creación de
 * `User` + `UserProfile` se hace con dos `save()` secuenciales, no dentro
 * de una única transacción de base de datos. Si el segundo `save()` falla
 * tras el primero, queda un `User` huérfano sin `UserProfile` — un caso
 * excepcional (fallo de DB entre dos escrituras consecutivas) que no se
 * mitiga aquí; ver el reporte de esta tarea para el detalle del trade-off.
 */
export class ProvisionWorkerUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(UNIT_OF_WORK)
    private readonly uow: UnitOfWork,

    @Inject(DOMAIN_EVENT_BUS)
    private readonly eventBus: DomainEventBus,
  ) {}

  async execute(input: {
    firstName: string;
    lastName: string;
    contactEmail: string;
    companyName: string;
  }): Promise<{ userId: string; loginEmail: string }> {
    const loginEmail = await generateWorkerLoginEmail(
      input.firstName,
      input.lastName,
      input.companyName,
      (candidate) => this.isEmailAvailable(candidate),
    );

    const tempPassword = generateTempPassword();
    const passwordHash = await this.passwordHasher.hash(tempPassword);

    const user = User.create({
      id: randomUUID(),
      email: EmailVO.create(loginEmail),
      passwordHash,
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      mustChangePassword: true,
    });

    const profile = UserProfile.createProvisioned({
      userId: user.id,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    await this.userRepository.save(user);
    await this.userProfileRepository.save(profile);

    this.eventBus.publish(
      new WorkerProvisionedEvent(
        user.id,
        loginEmail,
        tempPassword,
        input.contactEmail,
        input.firstName,
        input.companyName,
      ),
    );

    return { userId: user.id, loginEmail };
  }

  private async isEmailAvailable(candidate: string): Promise<boolean> {
    const existing = await this.userRepository.findByEmail(EmailVO.create(candidate));
    return existing === null;
  }
}
