import type { Request } from 'express';

/**
 * Construye el set de headers a reenviar del cliente hacia un servicio
 * downstream (auth-service, config-service).
 *
 * @remarks
 * Usa un allowlist explícito en vez de reenviar `req.headers` completo:
 * copiar headers arbitrarios permitiría que el cliente inyecte headers
 * internos (p. ej. de autenticación entre servicios) o contamine la
 * petición upstream con valores no esperados.
 *
 * @param req - Petición original del cliente.
 * @returns Headers filtrados listos para pasar como `headers` de Axios.
 */
export function forwardHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};

  const copy = (key: string) => {
    const value = req.headers[key];
    if (typeof value === 'string') {
      headers[key] = value;
    }
  };

  copy('content-type');
  copy('authorization');
  copy('accept-language');
  copy('x-correlation-id');
  copy('x-country');
  copy('x-device-fingerprint');
  copy('cookie');

  // No se copia el x-forwarded-for entrante (el cliente podría falsificarlo).
  // Se reenvía req.ip, que Express ya resolvió de forma confiable usando la
  // config `trust proxy` del gateway (ver main.ts).
  if (req.ip) {
    headers['x-forwarded-for'] = req.ip;
  }

  return headers;
}
