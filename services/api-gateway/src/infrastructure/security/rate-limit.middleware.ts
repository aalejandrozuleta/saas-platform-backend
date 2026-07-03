import rateLimit from 'express-rate-limit';

/**
 * Rate limiter global por IP: 100 requests/minuto.
 *
 * @remarks
 * Primera línea de defensa contra abuso genérico y DoS de bajo volumen
 * sobre cualquier endpoint del gateway. Expone los headers estándar
 * `RateLimit-*` (`standardHeaders: true`) y deshabilita los legacy
 * `X-RateLimit-*` para no duplicar información. Se aplica antes que
 * `authRateLimiter` en `main.ts`, por lo que las rutas de auth quedan
 * limitadas por ambos en cascada.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto (10 requests/minuto) para endpoints de autenticación.
 *
 * @remarks
 * Se aplica únicamente sobre las rutas listadas en `main.ts`
 * (login, register, refresh, 2fa/verify, change-password, etc.), que son
 * las más atractivas para ataques de fuerza bruta, credential stuffing y
 * enumeración de usuarios. Un límite tan bajo en el global no sería viable
 * para el resto de la API, de ahí la necesidad de un limiter dedicado y más
 * agresivo solo para esas rutas.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
