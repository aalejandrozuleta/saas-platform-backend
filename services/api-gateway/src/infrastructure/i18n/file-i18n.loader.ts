import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { loadMessagesFromDirectory } from '@saas/shared';

@Injectable()
export class FileI18nLoader {
  load(): Record<string, Record<string, string>> {
    return loadMessagesFromDirectory(
      join(
        process.cwd(),
        'src',
        'i18n',
      ),
    );
  }
}
