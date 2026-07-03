import { Module } from '@nestjs/common';
import { I18nService } from '@saas/shared';

import { FileI18nLoader } from './file-i18n.loader';

/**
 * Módulo de internacionalización del gateway.
 *
 * Construye el `I18nService` compartido a partir de los mensajes que
 * carga `FileI18nLoader` desde disco, con `es` como idioma por defecto.
 */
@Module({
  providers: [
    FileI18nLoader,
    {
      provide: I18nService,
      useFactory: (loader: FileI18nLoader) => {
        return new I18nService(loader.load(), 'es');
      },
      inject: [FileI18nLoader],
    },
  ],
  exports: [I18nService],
})
export class I18nModule {}
