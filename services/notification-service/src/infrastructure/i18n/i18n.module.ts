import { Module } from '@nestjs/common';
import { I18nService } from '@saas/shared';

import { FileI18nLoader } from './file-i18n.loader';

/**
 * Módulo de internacionalización: construye `I18nService` (paquete
 * `@saas/shared`) con los mensajes cargados por `FileI18nLoader` y `es`
 * como idioma por defecto. Lo consume `NotificationGlobalExceptionFilter`
 * para traducir mensajes de error según el header `Accept-Language`.
 */
@Module({
  providers: [
    FileI18nLoader,
    {
      provide: I18nService,
      useFactory: (loader: FileI18nLoader) => new I18nService(loader.load(), 'es'),
      inject: [FileI18nLoader],
    },
  ],
  exports: [I18nService],
})
export class I18nModule {}
