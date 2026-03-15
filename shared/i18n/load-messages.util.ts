import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const JSON_EXTENSION = '.json';

export const loadMessagesFromDirectory = (
  basePath: string,
): Record<string, Record<string, string>> => {
  const locales = readdirSync(basePath, {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory());

  return locales.reduce<Record<string, Record<string, string>>>(
    (messages, locale) => {
      messages[locale.name] = loadLocaleMessages(join(basePath, locale.name));
      return messages;
    },
    {},
  );
};

const loadLocaleMessages = (localePath: string): Record<string, string> => {
  const entries = readdirSync(localePath, {
    withFileTypes: true,
  });

  return entries.reduce<Record<string, string>>((messages, entry) => {
    const fullPath = join(localePath, entry.name);

    if (entry.isDirectory()) {
      return {
        ...messages,
        ...loadLocaleMessages(fullPath),
      };
    }

    if (entry.isFile() && entry.name.endsWith(JSON_EXTENSION)) {
      return {
        ...messages,
        ...JSON.parse(readFileSync(fullPath, 'utf-8')),
      };
    }

    return messages;
  }, {});
};
