/**
 * Tokens de inyección de dependencias (DI) de NestJS para los
 * repositorios del dominio. Se usan con `@Inject(...)` para resolver
 * la implementación concreta (Prisma, etc.) de cada interfaz de
 * repositorio.
 */
export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');
export const COMPANY_MEMBERSHIP_REPOSITORY = Symbol('COMPANY_MEMBERSHIP_REPOSITORY');
