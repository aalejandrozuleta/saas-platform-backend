import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { loadMessagesFromDirectory } from '@saas/shared';

/**
 * Carga los mensajes de traducción del servicio desde archivos en disco
 * (`src/i18n/`). Cada subcarpeta representa un idioma y contiene los
 * mensajes clave-valor usados por `I18nService`.
 */
@Injectable()
export class FileI18nLoader {
  /** Lee y devuelve todos los mensajes, agrupados por idioma. */
  load(): Record<string, Record<string, string>> {
    return loadMessagesFromDirectory(join(process.cwd(), 'src', 'i18n'));
  }
}
