import { Inject } from '@nestjs/common';
import { SESSION_REPOSITORY } from '@domain/token/repositories.tokens';
import { SessionRepository } from '@application/ports/session.repository';

/**
 * Caso de uso: listar las sesiones activas del usuario.
 *
 * @remarks
 * Se usa para la pantalla de "sesiones activas" en la que el usuario puede
 * revisar desde qué dispositivos/ubicaciones tiene acceso vigente y
 * detectar accesos no reconocidos. Cada sesión retornada se marca con
 * `isCurrent` para identificar la sesión desde la que se hace la petición,
 * de forma que el cliente pueda evitar ofrecer revocar la sesión propia
 * junto con las demás sin distinción.
 */
export class GetSessionsUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: SessionRepository,
  ) {}

  /**
   * Ejecuta la consulta de sesiones activas.
   *
   * @param userId - Identificador del usuario autenticado
   * @param currentSessionId - Identificador de la sesión desde la que se
   * realiza la petición (extraído del JWT), usado para marcar `isCurrent`
   * @returns Lista de sesiones activas con su información de dispositivo y ubicación
   */
  async execute(userId: string, currentSessionId: string) {
    const sessions = await this.sessionRepository.findActiveSessions(userId);

    return sessions.map((s) => ({
      id: s.id,
      isCurrent: s.id === currentSessionId,
      ipAddress: s.ipAddress,
      country: s.country,
      startedAt: s.startedAt,
      device: s.device,
    }));
  }
}
