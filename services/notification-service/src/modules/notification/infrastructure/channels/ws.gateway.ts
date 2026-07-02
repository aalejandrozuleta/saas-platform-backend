import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verify, JwtPayload } from 'jsonwebtoken';
import { EnvService } from '@config/env/env.service';

const ACCESS_TOKEN_COOKIE = 'accessToken';

/**
 * Gateway WebSocket.
 * Clientes se conectan a ws://<host>:3003; la sala personal (`user:<id>`) se
 * asigna a partir del accessToken (cookie) verificado en el handshake, nunca
 * de un userId que el propio cliente declare — de lo contrario cualquiera
 * podría unirse a la sala de otro usuario e interceptar sus notificaciones.
 * Sin token válido, la conexión queda anónima (sin sala) y solo recibe
 * eventos de broadcast.
 */
@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class WsNotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsNotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly env: EnvService) {}

  handleConnection(client: Socket): void {
    const userId = this.verifyUserId(client);

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

  /**
   * Extrae y verifica el accessToken de la cookie del handshake.
   * Devuelve el userId solo si la firma, issuer y audience son válidos.
   */
  private verifyUserId(client: Socket): string | undefined {
    const token = this.extractAccessToken(client);
    if (!token) {
      return undefined;
    }

    try {
      const payload = verify(token, this.env.get('JWT_ACCESS_SECRET'), {
        issuer: 'auth-service',
        audience: 'api-gateway',
        algorithms: ['HS256'],
      }) as JwtPayload;

      return typeof payload.sub === 'string' ? payload.sub : undefined;
    } catch {
      return undefined;
    }
  }

  private extractAccessToken(client: Socket): string | undefined {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }

    const prefix = `${ACCESS_TOKEN_COOKIE}=`;
    const rawCookie = cookieHeader
      .split(';')
      .map((pair) => pair.trim())
      .find((pair) => pair.startsWith(prefix));

    if (!rawCookie) {
      return undefined;
    }

    try {
      return decodeURIComponent(rawCookie.slice(prefix.length));
    } catch {
      return undefined;
    }
  }
}
