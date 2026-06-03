import type { Request } from 'express';

import type { ApiResponseMeta } from './response.interface';

const isDefined = (value: unknown): boolean => value !== undefined;

export const compactResponseMeta = (
  meta?: ApiResponseMeta,
): ApiResponseMeta | undefined => {
  if (!meta) {
    return undefined;
  }

  const entries = Object.entries(meta).filter(([, value]) => isDefined(value));

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries) as ApiResponseMeta;
};

export const buildResponseMeta = (
  req: Pick<Request, 'headers' | 'originalUrl' | 'url' | 'path'>,
  statusCode: number,
  lang?: string,
): ApiResponseMeta => {
  return (
    compactResponseMeta({
      timestamp: new Date().toISOString(),
      path: req.originalUrl ?? req.url ?? req.path,
      requestId: resolveRequestId(req.headers),
      lang,
      statusCode,
    }) ?? {}
  );
};

const resolveRequestId = (
  headers: Request['headers'],
): string | undefined => {
  const candidate = headers['x-correlation-id'] ?? headers['x-request-id'];

  return typeof candidate === 'string' ? candidate : undefined;
};
