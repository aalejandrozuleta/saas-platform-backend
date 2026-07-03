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

// El decorador @WebSocketGateway evalúa sus opciones al cargar el módulo,
// antes de que Nest instancie EnvService, así que el origin se lee
// directamente de process.env en vez de vía inyección de dependencias.
const wsCorsOrigins = (process.env.WS_CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

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
  cors: { origin: wsCorsOrigins, credentials: true },
  namespace: '/notifications',
})
export class WsNotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsNotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly env: EnvService) {}

  /**
   * Maneja una nueva conexión Socket.io. Verifica el accessToken (si viene
   * en la cookie del handshake) y, de ser válido, une al cliente a su sala
   * personal `user:<userId>` para poder recibir notificaciones dirigidas.
   * No rechaza conexiones sin token válido: quedan anónimas y solo reciben
   * eventos de broadcast (ver doc de la clase).
   */
  handleConnection(client: Socket): void {
    const userId = this.verifyUserId(client);

    if (userId) {
      void client.join(`user:${userId}`);
    }

    this.logger.log(`Cliente conectado: ${client.id} userId=${userId ?? 'anon'}`);
  }

  /** Solo registra el evento; Socket.io limpia la membresía de salas automáticamente. */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Emite `event` con `data` a todos los clientes conectados al namespace
   * `/notifications`, sin importar si están autenticados o no.
   *
   * @param event - Nombre del evento Socket.io.
   * @param data - Payload serializable a enviar.
   */
  broadcast(event: string, data: unknown): void {
    this.server.emit(event, data);
  }

  /**
   * Emite `event` con `data` únicamente a los sockets unidos a la sala
   * `user:<userId>`. Si el usuario no tiene ningún socket conectado en ese
   * momento, la emisión es un no-op silencioso (no hay cola de reintento a
   * este nivel; ver `WsConsumer` para la política de reintentos del job).
   *
   * @param userId - Identificador del usuario destino.
   * @param event - Nombre del evento Socket.io.
   * @param data - Payload serializable a enviar.
   */
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

  /**
   * Parsea el header `Cookie` crudo del handshake para extraer el valor de
   * `accessToken`. Socket.io no expone un parser de cookies propio en el
   * handshake, así que se hace manualmente aquí.
   */
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
