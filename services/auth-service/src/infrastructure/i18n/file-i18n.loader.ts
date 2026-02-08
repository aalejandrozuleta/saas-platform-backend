import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class FileI18nLoader {
  load(): Record<string, Record<string, string>> {
    const basePath = join(
      process.cwd(),
      'src',
      'i18n',
    );

    return {
      en: JSON.parse(
        readFileSync(join(basePath, 'en', 'auth.json'), 'utf-8'),
      ),
      es: JSON.parse(
        readFileSync(join(basePath, 'es', 'auth.json'), 'utf-8'),
      ),
    };
  }
}
