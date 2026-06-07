import { ArgumentsHost, Catch } from '@nestjs/common';
import { GlobalExceptionFilter } from '@saas/shared';

/**
 * Filtro de excepciones del config-service.
 *
 * @remarks
 * Extiende el filtro global compartido sin lógica adicional.
 * La separación permite sobreescribir comportamiento específico del servicio
 * en el futuro sin modificar el código compartido.
 */
@Catch()
export class ConfigGlobalExceptionFilter extends GlobalExceptionFilter {
  override catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);
  }
}
