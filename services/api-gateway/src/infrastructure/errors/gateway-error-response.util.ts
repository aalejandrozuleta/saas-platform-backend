import { join } from 'node:path';

import type { Request } from 'express';
import {
  ErrorCode,
  I18nService,
  buildResponseMeta,
  errorResponse,
  loadMessagesFromDirectory,
} from '@saas/shared';

const gatewayI18n = new I18nService(
  loadMessagesFromDirectory(
    join(
      process.cwd(),
      'src',
      'i18n',
    ),
  ),
  'es',
);

interface GatewayErrorOptions {
  details?: unknown;
  metadata?: Record<string, unknown> | null;
}

export const buildGatewayErrorResponse = (
  req: Pick<Request, 'headers' | 'originalUrl' | 'url' | 'path'>,
  statusCode: number,
  code: ErrorCode,
  messageKey: string,
  options: GatewayErrorOptions = {},
) => {
  const requestedLanguage = getRequestedLanguage(req);
  const resolvedLanguage = gatewayI18n.resolveLanguage(
    requestedLanguage,
  );

  return errorResponse(
    {
      code,
      message: gatewayI18n.translate(messageKey, requestedLanguage),
      details: options.details,
      metadata: options.metadata,
    },
    {
      meta: buildResponseMeta(
        req,
        statusCode,
        resolvedLanguage,
      ),
    },
  );
};

const getRequestedLanguage = (
  req: Pick<Request, 'headers'>,
): string | undefined => {
  const acceptLanguage = req.headers['accept-language'];

  return typeof acceptLanguage === 'string' ? acceptLanguage : undefined;
};
