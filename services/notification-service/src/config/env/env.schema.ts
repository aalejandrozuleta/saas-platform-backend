import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3003),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().min(16),

  /** Secreto compartido con auth-service; ver InternalServiceGuard. */
  INTERNAL_SERVICE_SECRET: z.string().min(32),
  /** Verifica el accessToken (cookie) en el handshake del WS gateway; debe coincidir con auth-service/api-gateway. */
  JWT_ACCESS_SECRET: z.string().min(32),

  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email().default('noreply@saas-platform.dev'),

  // Reintentos para la cola de email
  EMAIL_QUEUE_ATTEMPTS: z.coerce.number().default(5),
  EMAIL_QUEUE_BACKOFF_DELAY: z.coerce.number().default(5000),

  // Reintentos para la cola de WebSocket
  WS_QUEUE_ATTEMPTS: z.coerce.number().default(3),
  WS_QUEUE_BACKOFF_DELAY: z.coerce.number().default(2000),
});

export type EnvVars = z.infer<typeof envSchema>;
