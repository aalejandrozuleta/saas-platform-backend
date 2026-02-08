/**
 * Servicio genérico de internacionalización.
 * No depende del origen de los mensajes.
 */
export class I18nService {
  constructor(
    private readonly messages: Record<string, Record<string, string>>,
    private readonly defaultLang: string = 'es',
  ) {}

  /**
   * Traduce una clave según idioma.
   * @param key Clave del mensaje
   * @param lang Idioma solicitado
   */
  translate(key: string, lang?: string): string {
    const selectedLang = lang ?? this.defaultLang;

    return (
      this.messages[selectedLang]?.[key] ??
      this.messages[this.defaultLang]?.[key] ??
      key
    );
  }
}
