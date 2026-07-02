import { sign } from 'jsonwebtoken';
import { type Server, type Socket } from 'socket.io';
import { type EnvService } from '@config/env/env.service';

import { WsNotificationsGateway } from './ws.gateway';

const JWT_SECRET = 'a'.repeat(32);

const signAccessToken = (payload: object, overrides: { secret?: string } = {}): string =>
  sign(payload, overrides.secret ?? JWT_SECRET, {
    issuer: 'auth-service',
    audience: 'api-gateway',
    expiresIn: 900,
  });

const makeClient = (cookieHeader: string | undefined, id = 'socket-1'): Socket => {
  const join = jest.fn();
  return {
    id,
    handshake: { headers: { cookie: cookieHeader } },
    join,
  } as unknown as Socket & { join: jest.Mock };
};

describe('WsNotificationsGateway', () => {
  let gateway: WsNotificationsGateway;
  let server: jest.Mocked<Server>;
  let toMock: jest.Mock;
  let emitToRoomMock: jest.Mock;
  let env: EnvService;

  beforeEach(() => {
    emitToRoomMock = jest.fn();
    toMock = jest.fn().mockReturnValue({ emit: emitToRoomMock });

    server = {
      emit: jest.fn(),
      to: toMock,
    } as any;

    env = { get: jest.fn().mockReturnValue(JWT_SECRET) } as unknown as EnvService;

    gateway = new WsNotificationsGateway(env);
    gateway.server = server;
  });

  describe('handleConnection', () => {
    it('debe unir al cliente a su sala personal cuando trae un accessToken válido', () => {
      const token = signAccessToken({ sub: 'user-1', sid: 'session-1', role: 'USER' });
      const client = makeClient(`accessToken=${token}`);

      gateway.handleConnection(client);

      expect((client as any).join).toHaveBeenCalledWith('user:user-1');
    });

    it('no debe unir al cliente a ninguna sala si no trae cookie', () => {
      const client = makeClient(undefined);

      gateway.handleConnection(client);

      expect((client as any).join).not.toHaveBeenCalled();
    });

    it('no debe confiar en un userId declarado por el cliente sin verificación (query)', () => {
      const join = jest.fn();
      const client = {
        id: 'socket-2',
        handshake: { headers: {}, query: { userId: 'attacker-controlled' } },
        join,
      } as unknown as Socket;

      gateway.handleConnection(client);

      expect(join).not.toHaveBeenCalled();
    });

    it('no debe unir al cliente si el token está firmado con otro secreto', () => {
      const token = signAccessToken(
        { sub: 'user-1', sid: 'session-1', role: 'USER' },
        { secret: 'wrong-secret-wrong-secret-wrong' },
      );
      const client = makeClient(`accessToken=${token}`);

      gateway.handleConnection(client);

      expect((client as any).join).not.toHaveBeenCalled();
    });

    it('no debe unir al cliente si el issuer/audience no coinciden', () => {
      const token = sign({ sub: 'user-1' }, JWT_SECRET, {
        issuer: 'someone-else',
        audience: 'api-gateway',
        expiresIn: 900,
      });
      const client = makeClient(`accessToken=${token}`);

      gateway.handleConnection(client);

      expect((client as any).join).not.toHaveBeenCalled();
    });

    it('no debe unir al cliente si el token no tiene claim sub', () => {
      const token = sign({}, JWT_SECRET, {
        issuer: 'auth-service',
        audience: 'api-gateway',
        expiresIn: 900,
      });
      const client = makeClient(`accessToken=${token}`);

      gateway.handleConnection(client);

      expect((client as any).join).not.toHaveBeenCalled();
    });

    it('debe ignorar cookies mal formadas sin lanzar', () => {
      const client = makeClient('%');

      expect(() => gateway.handleConnection(client)).not.toThrow();
      expect((client as any).join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('no debe lanzar al desconectar un cliente', () => {
      const client = { id: 'socket-3' } as Socket;

      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('broadcast', () => {
    it('debe emitir el evento a todos los clientes conectados', () => {
      gateway.broadcast('maintenance.scheduled', { message: 'hola' });

      expect(server.emit).toHaveBeenCalledWith('maintenance.scheduled', {
        message: 'hola',
      });
    });
  });

  describe('sendToUser', () => {
    it('debe emitir el evento únicamente a la sala del usuario', () => {
      gateway.sendToUser('user-1', 'security.alert', { message: 'alerta' });

      expect(toMock).toHaveBeenCalledWith('user:user-1');
      expect(emitToRoomMock).toHaveBeenCalledWith('security.alert', {
        message: 'alerta',
      });
    });
  });
});
