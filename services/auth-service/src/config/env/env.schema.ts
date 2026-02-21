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
  JWT_EXPIRES_IN: z.string(),

  DATABASE_URL: z.string(),
  MONGO_URL: z.string(),
});

export type EnvVars = z.infer<typeof envSchema>;
