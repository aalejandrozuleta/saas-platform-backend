import { type LoggerOptions } from './logger.types';

// Nombres de campo sensibles, en camelCase y snake_case: los objetos
// logueados (payloads de eventos, DTOs, etc.) no siguen una única
// convención de nombres.
const SENSITIVE_FIELDS = [
  'password',
  'pass',
  'passwordHash',
  'password_hash',
  'hashedPassword',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'secret',
  'clientSecret',
  'client_secret',
  'apiKey',
  'api_key',
  'totpSecret',
  'totp_secret',
  'totpPendingSecret',
  'totp_pending_secret',
  'totpCode',
  'totp_code',
  'verificationToken',
  'verification_token',
];

// Profundidad máxima de anidamiento a cubrir. fast-redact (el motor de
// redacción de pino) no soporta un comodín de profundidad arbitraria
// (`**`), así que hay que enumerar explícitamente cada nivel; un wildcard
// de un solo nivel (`*.password`) se salta tanto el campo en la raíz
// (`password`) como el anidado dos o más niveles (`user.creds.password`).
const MAX_REDACT_DEPTH = 3;

function pathsForField(field: string): string[] {
  const paths = [field];
  let prefix = '*';
  for (let depth = 1; depth <= MAX_REDACT_DEPTH; depth += 1) {
    paths.push(`${prefix}.${field}`);
    prefix += '.*';
  }
  return paths;
}

/**
 * Construye la configuración base para una instancia de Pino.
 *
 * Se mantiene en shared para que todos los microservicios logueen con el
 * mismo formato (útil para Loki/Grafana) y, sobre todo, con la misma
 * política de redacción de campos sensibles. Antes de agregar un campo
 * nuevo con datos sensibles a cualquier DTO/payload, revisa
 * `SENSITIVE_FIELDS` en este archivo y añádelo ahí si corresponde — de lo
 * contrario terminará en texto plano en los logs.
 *
 * @param options - Nivel de log y nombre del servicio (ver {@link LoggerOptions}).
 * @returns Objeto de opciones listo para pasar a `pino(...)`.
 */
export const createPinoConfig = (options: LoggerOptions) => ({
  level: options.level,
  base: {
    service: options.serviceName,
  },
  redact: {
    paths: [
      ...SENSITIVE_FIELDS.flatMap(pathsForField),
      // HTTP headers que suelen traer secretos
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'req.headers["x-internal-api-key"]',
    ],
    remove: true,
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});
