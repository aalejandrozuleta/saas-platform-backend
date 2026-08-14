import { type SessionRepository } from '@application/ports/session.repository';

import { GetSessionsUseCase } from './get-sessions.use-case';

describe('GetSessionsUseCase', () => {
  let useCase: GetSessionsUseCase;
  let sessionRepository: jest.Mocked<SessionRepository>;

  beforeEach(() => {
    sessionRepository = {
      findActiveSessions: jest.fn(),
    } as any;

    useCase = new GetSessionsUseCase(sessionRepository);
  });

  it('debe listar las sesiones activas marcando la actual', async () => {
    const startedAt = new Date();
    sessionRepository.findActiveSessions.mockResolvedValue([
      {
        id: 'session-1',
        ipAddress: '127.0.0.1',
        country: 'CO',
        startedAt,
        device: 'Chrome',
      },
      {
        id: 'session-2',
        ipAddress: '10.0.0.1',
        country: 'US',
        startedAt,
        device: 'Firefox',
      },
    ] as any);

    const result = await useCase.execute('user-1', 'session-2');

    expect(sessionRepository.findActiveSessions).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([
      {
        id: 'session-1',
        isCurrent: false,
        ipAddress: '127.0.0.1',
        country: 'CO',
        startedAt,
        device: 'Chrome',
      },
      {
        id: 'session-2',
        isCurrent: true,
        ipAddress: '10.0.0.1',
        country: 'US',
        startedAt,
        device: 'Firefox',
      },
    ]);
  });

  it('debe devolver un arreglo vacío si no hay sesiones activas', async () => {
    sessionRepository.findActiveSessions.mockResolvedValue([]);

    const result = await useCase.execute('user-1', 'session-1');

    expect(result).toEqual([]);
  });
});
