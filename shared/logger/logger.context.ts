import { requestContextStorage } from "../context";

/**
 * Agrega automáticamente información del contexto
 * (requestId, userId, correlationId) a los logs.
 */
export const enrichWithContext = (
  meta?: Record<string, unknown>
): Record<string, unknown> => {
  const context = requestContextStorage.getStore();

  if (!context) return meta ?? {};

  return {
    requestId: context.requestId,
    correlationId: context.correlationId,
    userId: context.userId,
    ...meta
  };
};
