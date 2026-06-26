import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3003),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@saas-platform.dev'),

  // Reintentos para la cola de email
  EMAIL_QUEUE_ATTEMPTS: z.coerce.number().default(5),
  EMAIL_QUEUE_BACKOFF_DELAY: z.coerce.number().default(5000),

  // Reintentos para la cola de WebSocket
  WS_QUEUE_ATTEMPTS: z.coerce.number().default(3),
  WS_QUEUE_BACKOFF_DELAY: z.coerce.number().default(2000),
});

export type EnvVars = z.infer<typeof envSchema>;
