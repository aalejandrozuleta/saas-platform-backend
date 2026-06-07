import { Module } from '@nestjs/common';
import { I18nModule as SharedI18nModule, FileI18nLoader } from '@saas/shared';
import * as path from 'node:path';

@Module({
  imports: [
    SharedI18nModule.forRoot({
      loader: FileI18nLoader,
      loaderOptions: {
        path: path.join(__dirname, '../../i18n'),
      },
    }),
  ],
  exports: [SharedI18nModule],
})
export class I18nModule {}
