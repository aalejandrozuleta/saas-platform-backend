import { type Server, type Socket } from 'socket.io';

import { WsNotificationsGateway } from './ws.gateway';

describe('WsNotificationsGateway', () => {
  let gateway: WsNotificationsGateway;
  let server: jest.Mocked<Server>;
  let toMock: jest.Mock;
  let emitToRoomMock: jest.Mock;

  beforeEach(() => {
    emitToRoomMock = jest.fn();
    toMock = jest.fn().mockReturnValue({ emit: emitToRoomMock });

    server = {
      emit: jest.fn(),
      to: toMock,
    } as any;

    gateway = new WsNotificationsGateway();
    gateway.server = server;
  });

  describe('handleConnection', () => {
    it('debe unir al cliente a su sala personal cuando trae userId', () => {
      const join = jest.fn();
      const client = {
        id: 'socket-1',
        handshake: { query: { userId: 'user-1' } },
        join,
      } as unknown as Socket;

      gateway.handleConnection(client);

      expect(join).toHaveBeenCalledWith('user:user-1');
    });

    it('no debe intentar unir al cliente a ninguna sala si no trae userId', () => {
      const join = jest.fn();
      const client = {
        id: 'socket-2',
        handshake: { query: {} },
        join,
      } as unknown as Socket;

      gateway.handleConnection(client);

      expect(join).not.toHaveBeenCalled();
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
