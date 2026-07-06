import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno.
 *
 * ❗ Si falla, la app NO arranca.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3001),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  TOTP_ENCRYPTION_KEY: z
    .string()
    .length(64, 'TOTP_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)'),

  ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().default(604800),
  REDIS_SESSION_TTL: z.coerce.number().default(900),

  DATABASE_URL: z.string(),
  MONGO_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().min(16),

  NOTIFICATION_SERVICE_URL: z.string().default('http://notification-service:3003'), // NOSONAR: internal Docker network address (service-to-service), not exposed externally
  NOTIFICATION_SERVICE_TIMEOUT: z.coerce.number().default(5000),
  /** Secreto compartido con notification-service; ver InternalServiceGuard. */
  INTERNAL_SERVICE_SECRET: z.string().min(32),

  APP_URL: z.string().default('http://localhost:4200'),
  EMAIL_VERIFICATION_TTL: z.coerce.number().default(86400),
  PASSWORD_RESET_TTL: z.coerce.number().default(1800),
});

export type EnvVars = z.infer<typeof envSchema>;
