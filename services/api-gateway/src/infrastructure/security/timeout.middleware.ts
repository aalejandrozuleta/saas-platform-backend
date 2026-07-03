import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';
import { buildGatewayErrorResponse } from '@infrastructure/errors/gateway-error-response.util';

/**
 * Corta la respuesta a los 10s si no se completó, evitando que conexiones
 * colgadas (p. ej. un servicio downstream que nunca responde) agoten el
 * pool de sockets del gateway.
 *
 * @remarks
 * Es un límite de "última línea de defensa" a nivel de socket HTTP,
 * independiente del `circuitTimeout` de `ResilientHttpClient`: mientras ese
 * timeout protege cada llamada saliente individual del gateway hacia un
 * servicio (auth-service, config-service), este protege la conexión
 * entrante del cliente contra el gateway en su conjunto, cubriendo también
 * escenarios donde el cuelgue ocurre en lógica propia del gateway y no en
 * una llamada HTTP saliente.
 */
export function timeoutMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setTimeout(10_000, () => {
    if (!res.headersSent) {
      res
        .status(504)
        .json(
          buildGatewayErrorResponse(req, 504, ErrorCode.GATEWAY_TIMEOUT, 'common.gateway_timeout'),
        );
    }
  });

  next();
}
