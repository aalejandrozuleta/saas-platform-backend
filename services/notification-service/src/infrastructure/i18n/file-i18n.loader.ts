import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { loadMessagesFromDirectory } from '@saas/shared';

/**
 * Carga los mensajes de traducción del servicio desde el filesystem.
 *
 * @remarks
 * Delega el parseo real en `loadMessagesFromDirectory` (paquete
 * `@saas/shared`); acá solo se resuelve la carpeta `src/i18n` relativa al
 * cwd del proceso. Se ejecuta una sola vez, al construir `I18nService` en
 * `I18nModule` (no hay recarga en caliente de los archivos de traducción).
 */
@Injectable()
export class FileI18nLoader {
  /** @returns Mensajes agrupados por idioma y luego por clave (`{ es: { 'common.error': '...' } }`). */
  load(): Record<string, Record<string, string>> {
    return loadMessagesFromDirectory(join(process.cwd(), 'src', 'i18n'));
  }
}
