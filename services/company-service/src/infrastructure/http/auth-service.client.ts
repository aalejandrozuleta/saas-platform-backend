import { Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { EnvService } from '@config/env/env.service';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import {
  type AuthServiceClientPort,
  type LookedUpUser,
} from '@application/ports/auth-service-client.port';

/** Ruta del endpoint interno de auth-service que resuelve un usuario por email. */
const USER_LOOKUP_PATH = '/auth/v1/users/lookup';

/**
 * Cliente HTTP interno hacia auth-service.
 *
 * @remarks
 * Deliberadamente más liviano que el `ResilientHttpClient` del api-gateway
 * (sin circuit breaker): es una llamada puntual, de baja frecuencia, dentro
 * de la red interna. Sí maneja timeout y traduce los errores del transporte
 * a errores de dominio:
 * - 404 → `null` (el email no corresponde a ningún usuario).
 * - cualquier otro fallo → `SERVICE_UNAVAILABLE`, para no filtrar detalles
 *   internos de auth-service al cliente final.
 */
@Injectable()
export class AuthServiceHttpClient implements AuthServiceClientPort {
  private readonly http: AxiosInstance;

  constructor(private readonly envService: EnvService) {
    this.http = axios.create({
      baseURL: this.envService.get('AUTH_SERVICE_URL'),
      timeout: this.envService.get('AUTH_SERVICE_TIMEOUT'),
      headers: {
        'x-internal-api-key': this.envService.get('INTERNAL_SERVICE_SECRET'),
      },
    });
  }

  async lookupUserByEmail(email: string): Promise<LookedUpUser | null> {
    try {
      const response = await this.http.get(USER_LOOKUP_PATH, { params: { email } });
      const data = response.data?.data ?? response.data;

      if (!data?.userId) {
        return null;
      }

      return { userId: data.userId, email: data.email };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }

      throw DomainErrorFactory.authServiceUnavailable();
    }
  }
}
