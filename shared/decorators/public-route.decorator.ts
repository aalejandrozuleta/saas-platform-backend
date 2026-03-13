import { SetMetadata } from '@nestjs/common';

/**
 * Key usada por el guard para identificar rutas públicas
 */
export const PUBLIC_ROUTE_KEY = 'publicRoute';

/**
 * Decorador para marcar endpoints públicos
 * (no requieren autenticación)
 */
export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);