import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno del config-service.
 * El arranque falla inmediatamente si alguna variable es inválida.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3002),

  DATABASE_URL: z.string(),
  MONGO_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().optional(),

  CONFIG_CACHE_TTL: z.coerce.number().default(300),

  /** Secreto compartido con el API Gateway; ver InternalServiceGuard. */
  INTERNAL_SERVICE_SECRET: z.string().min(32),
});

export type EnvVars = z.infer<typeof envSchema>;
