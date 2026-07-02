import type { Request } from 'express';

export function forwardHeaders(req: Request): Record<string, string> {
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

  // No se copia el x-forwarded-for entrante (el cliente podría falsificarlo).
  // Se reenvía req.ip, que Express ya resolvió de forma confiable usando la
  // config `trust proxy` del gateway (ver main.ts).
  if (req.ip) {
    headers['x-forwarded-for'] = req.ip;
  }

  return headers;
}
