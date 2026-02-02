import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno del API Gateway.
 * Falla en el arranque si algo es inválido.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value ? value.split(',').map((v) => v.trim()) : [],
    ),

  TRUST_PROXY: z.coerce.number().default(1),

  AUTH_SERVICE_URL: z.string().default('localhost:3001')
});

export type EnvVars = z.infer<typeof envSchema>;
