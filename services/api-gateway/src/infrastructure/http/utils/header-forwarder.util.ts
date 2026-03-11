import type { Request } from 'express';

export function forwardHeaders(
  req: Request,
): Record<string, string> {

  const headers: Record<string, string> = {};

  const copy = (key: string) => {
    const value = req.headers[key];
    if (typeof value === 'string') {
      headers[key] = value;
    }
  };

  copy('content-type');
  copy('authorization');
  copy('accept-language');
  copy('x-correlation-id');
  copy('x-country');
  copy('x-device-fingerprint');
  copy('cookie');

  return headers;
}