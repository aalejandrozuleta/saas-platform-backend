/**
 * Archivo reservado para tokens de inyección de dependencias (DI) de
 * infraestructura.
 *
 * @remarks
 * Actualmente no exporta nada: los tokens de infraestructura (hashing,
 * tokens, cache, TOTP, etc.) viven en `./services.tokens.ts` y los de
 * repositorios en `./repositories.tokens.ts`. Este módulo no está importado
 * desde ningún otro archivo del servicio. Se documenta su estado en lugar de
 * eliminarlo porque este cambio es documentación-only y no debe alterar la
 * estructura de archivos del servicio.
 */
export {};
