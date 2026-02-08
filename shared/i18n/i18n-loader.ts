/**
 * Contrato para cargar mensajes de internacionalización.
 */
export interface I18nLoader {
  /**
   * Carga los mensajes por idioma.
   */
  load(): Record<string, Record<string, string>>;
}
