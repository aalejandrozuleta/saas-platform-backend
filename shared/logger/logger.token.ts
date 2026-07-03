/**
 * Token de inyección de Nest para {@link PlatformLogger}.
 *
 * Se usa siempre en conjunto con `@Inject`, ya que `PlatformLogger` es una
 * interfaz y no puede resolverse por tipo:
 *
 * @example
 * ```ts
 * constructor(
 *   \@Inject(PLATFORM_LOGGER) private readonly logger: PlatformLogger,
 * ) {}
 * ```
 */
export const PLATFORM_LOGGER = Symbol('PLATFORM_LOGGER');
