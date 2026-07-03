import { Module } from '@nestjs/common';
import { I18nService } from '@saas/shared';

import { FileI18nLoader } from './file-i18n.loader';

/**
 * Módulo de internacionalización de config-service.
 * Construye `I18nService` a partir de los mensajes cargados por
 * `FileI18nLoader`, con `es` (español) como idioma por defecto.
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
