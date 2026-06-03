export type TranslationParams = Record<string, unknown>;

/**
 * Servicio genérico de internacionalización.
 * No depende del origen de los mensajes.
 */
export class I18nService {
  private readonly normalizedDefaultLang: string;

  constructor(
    private readonly messages: Record<string, Record<string, string>>,
    private readonly defaultLang: string = 'es',
  ) {
    this.normalizedDefaultLang = this.normalizeLang(defaultLang);
  }

  resolveLanguage(lang?: string): string {
    const requested = this.normalizeLang(lang);

    if (this.messages[requested]) {
      return requested;
    }

    const baseLang = requested.split('-')[0];

    if (this.messages[baseLang]) {
      return baseLang;
    }

    if (this.messages[this.normalizedDefaultLang]) {
      return this.normalizedDefaultLang;
    }

    return this.defaultLang;
  }

  /**
   * Traduce una clave según idioma.
   * @param key Clave del mensaje
   * @param lang Idioma solicitado
   */
  translate(
    key: string,
    lang?: string,
    params?: TranslationParams,
  ): string {
    const resolvedLang = this.resolveLanguage(lang);
    const defaultBaseLang = this.normalizedDefaultLang.split('-')[0];
    const template =
      this.messages[resolvedLang]?.[key] ??
      this.messages[resolvedLang.split('-')[0]]?.[key] ??
      this.messages[this.normalizedDefaultLang]?.[key] ??
      this.messages[defaultBaseLang]?.[key] ??
      key;

    return this.interpolate(template, params);
  }

  private normalizeLang(lang?: string): string {
    if (!lang) {
      return this.defaultLang;
    }

    return lang.split(',')[0].trim().toLowerCase();
  }

  private interpolate(
    template: string,
    params?: TranslationParams,
  ): string {
    if (!params) {
      return template;
    }

    return template.replaceAll(
      /\{\{\s*([\w.-]+)\s*\}\}/g,
      (_, key: string) => {
        const value = params[key];

        return value === undefined || value === null
          ? `{{${key}}}`
          : this.formatValue(value);
      },
    );
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return JSON.stringify(value);
  }
}
