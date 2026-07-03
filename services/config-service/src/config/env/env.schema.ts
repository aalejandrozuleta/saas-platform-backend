import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno del config-service.
 * El arranque falla inmediatamente si alguna variable es inválida.
 */
export const envSchema = z.object({
  /** Entorno de ejecución; afecta si Swagger queda expuesto (ver main.ts). */
  NODE_ENV: z.enum(['development', 'test', 'production']),
  /** Puerto HTTP del servicio. */
  PORT: z.coerce.number().default(3002),

  /** Cadena de conexión a PostgreSQL (Prisma). */
  DATABASE_URL: z.string(),
  /** Cadena de conexión a MongoDB, usada para el log de auditoría. */
  MONGO_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  /** Mínimo 16 caracteres: exigido por el hardening de auth de Redis. */
  REDIS_PASSWORD: z.string().min(16),

  /** TTL en segundos para entradas de `ConfigCache` (Redis). */
  CONFIG_CACHE_TTL: z.coerce.number().default(300),

  /** Secreto compartido con el API Gateway; ver InternalServiceGuard. */
  INTERNAL_SERVICE_SECRET: z.string().min(32),
});

export type EnvVars = z.infer<typeof envSchema>;
