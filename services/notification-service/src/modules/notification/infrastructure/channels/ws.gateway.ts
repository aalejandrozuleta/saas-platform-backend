import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Gateway WebSocket.
 * Clientes se conectan a ws://<host>:3003 y pueden unirse a su sala personal
 * enviando: { event: 'join', data: { userId: '<uuid>' } }
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class WsNotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsNotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const userId = client.handshake.query['userId'] as string | undefined;

    if (userId) {
      void client.join(`user:${userId}`);
    }

    this.logger.log(`Cliente conectado: ${client.id} userId=${userId ?? 'anon'}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  broadcast(event: string, data: unknown): void {
    this.server.emit(event, data);
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
