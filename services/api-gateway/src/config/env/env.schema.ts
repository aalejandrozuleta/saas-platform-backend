
import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno del API Gateway.
 * Falla en el arranque si algo es inválido.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),

  PORT: z.coerce.number().int().positive(),

  AUTH_SERVICE_URL: z.string(),
  AUTH_SERVICE_TIMEOUT: z.coerce.number().int().positive(),

  CORS_ORIGINS: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  TRUST_PROXY: z.coerce.number().int().min(0).max(1),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().int(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.coerce.boolean(),
});

export type EnvVars = z.infer<typeof envSchema>;
