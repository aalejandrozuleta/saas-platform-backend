import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const JSON_EXTENSION = '.json';

/**
 * Carga los mensajes de traducción desde un directorio de locales.
 *
 * Espera que `basePath` contenga un subdirectorio por cada locale (por
 * ejemplo, `es/`, `en/`) y que cada uno de esos subdirectorios contenga
 * uno o más archivos `.json` (pudiendo estar anidados en subcarpetas) con
 * pares clave-mensaje. Todos los archivos `.json` de un mismo locale se
 * combinan en un único objeto plano de mensajes.
 *
 * @param basePath - Ruta absoluta al directorio raíz de locales.
 * @returns Un mapa `locale -> (clave -> mensaje)`, listo para usar como
 *   fuente de traducciones del servicio de i18n.
 *
 * @example
 * ```ts
 * const messages = loadMessagesFromDirectory(join(__dirname, 'locales'));
 * // { es: { 'auth.invalid_credentials': 'Credenciales inválidas' }, en: { ... } }
 * ```
 */
export const loadMessagesFromDirectory = (
  basePath: string,
): Record<string, Record<string, string>> => {
  const locales = readdirSync(basePath, {
    withFileTypes: true,
  }).filter((entry) => entry.isDirectory());

  return locales.reduce<Record<string, Record<string, string>>>((messages, locale) => {
    messages[locale.name] = loadLocaleMessages(join(basePath, locale.name));
    return messages;
  }, {});
};

/**
 * Recorre recursivamente el directorio de un locale y combina el
 * contenido de todos los archivos `.json` encontrados en un único objeto
 * de mensajes.
 *
 * @param localePath - Ruta absoluta al directorio del locale.
 * @returns Mapa clave-mensaje con el contenido combinado de los `.json`.
 */
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
