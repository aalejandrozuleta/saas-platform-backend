import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno.
 *
 * ❗ Si falla, la app NO arranca.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3004),

  DATABASE_URL: z.string(),

  /**
   * Secreto de verificación del access token. company-service solo
   * **verifica** tokens emitidos por auth-service, nunca los firma, por lo
   * que este valor debe ser byte-idéntico al de auth-service.
   */
  JWT_ACCESS_SECRET: z.string().min(32),

  AUTH_SERVICE_URL: z.string().default('http://auth-service:3001'), // NOSONAR: internal Docker network address (service-to-service), not exposed externally
  AUTH_SERVICE_TIMEOUT: z.coerce.number().default(5000),

  /** Secreto compartido con auth-service; ver InternalServiceGuard. */
  INTERNAL_SERVICE_SECRET: z.string().min(32),

  // --- Storage (S3-compatible, MinIO en dev) para el logo de la empresa ---
  STORAGE_ENDPOINT: z.string(),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_BUCKET: z.string().default('company-logos'),
  STORAGE_ACCESS_KEY: z.string(),
  STORAGE_SECRET_KEY: z.string(),
  /** Prefijo público desde el que se sirven las imágenes ya subidas (bucket público de solo lectura). */
  STORAGE_PUBLIC_URL: z.string(),
});

export type EnvVars = z.infer<typeof envSchema>;
