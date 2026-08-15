import { ArgumentsHost, Catch } from '@nestjs/common';
import { GlobalExceptionFilter } from '@saas/shared';

/**
 * Filtro de excepciones del company-service.
 *
 * @remarks
 * Extiende el filtro global compartido sin lógica adicional: a diferencia
 * de auth-service, este servicio no tiene Mongo ni audit-log, así que no
 * hay efecto secundario de auditoría. La subclase existe para poder
 * agregar comportamiento propio del servicio a futuro sin tocar el código
 * compartido.
 */
@Catch()
export class CompanyGlobalExceptionFilter extends GlobalExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}
