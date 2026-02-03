import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Servicio simple de internacionalización.
 * Traduce claves según idioma.
 */
export class I18nService {
  private readonly messages: Record<string, Record<string, string>>;

  constructor() {
    this.messages = {
      en: JSON.parse(
        readFileSync(join(process.cwd(), 'src/i18n/en/auth.json'), 'utf-8'),
      ),
      es: JSON.parse(
        readFileSync(join(process.cwd(), 'src/i18n/es/auth.json'), 'utf-8'),
      ),
    };
  }

  /**
   * Traduce una clave según idioma
   * @param key Clave del mensaje
   * @param lang Idioma (en | es)
   */
  translate(key: string, lang: string): string {
    return this.messages[lang]?.[key] ?? this.messages.en[key] ?? key;
  }
}
