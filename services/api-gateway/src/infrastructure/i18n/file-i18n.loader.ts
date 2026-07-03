import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { loadMessagesFromDirectory } from '@saas/shared';

/**
 * Cargador de mensajes de i18n basado en archivos.
 *
 * @remarks
 * Lee recursivamente `src/i18n/<idioma>/**\/*.json` (uno o más directorios
 * por idioma, p. ej. `es` y `en`) y los combina en un único mapa
 * `idioma -> (clave -> mensaje)`. No aplica ningún fallback por sí mismo:
 * esa lógica vive en `I18nService`, que recibe el resultado de `load()`.
 */
@Injectable()
export class FileI18nLoader {
  /** Lee y combina todos los archivos de mensajes de `src/i18n`. */
  load(): Record<string, Record<string, string>> {
    return loadMessagesFromDirectory(join(process.cwd(), 'src', 'i18n'));
  }
}
