import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { loadMessagesFromDirectory } from '@saas/shared';

/**
 * Cargador de mensajes de i18n desde archivos en disco.
 */
@Injectable()
export class FileI18nLoader {
  /**
   * Carga todos los mensajes desde el directorio `src/i18n` del servicio.
   */
  load(): Record<string, Record<string, string>> {
    return loadMessagesFromDirectory(join(process.cwd(), 'src', 'i18n'));
  }
}
