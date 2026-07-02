import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno.
 *
 * ❗ Si falla, la app NO arranca.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3001),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),

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
  REDIS_PASSWORD: z.string().optional(),

  NOTIFICATION_SERVICE_URL: z.string().default('http://notification-service:3003'), // NOSONAR: internal Docker network address (service-to-service), not exposed externally

  APP_URL: z.string().default('http://localhost:4200'),
  EMAIL_VERIFICATION_TTL: z.coerce.number().default(86400),
});

export type EnvVars = z.infer<typeof envSchema>;
