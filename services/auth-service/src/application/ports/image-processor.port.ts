export interface SanitizedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

/**
 * Puerto para validar y sanear una imagen subida por el usuario antes de
 * almacenarla.
 *
 * @remarks
 * El `mimetype` que reporta multer viene del header `Content-Type` del
 * request — lo declara el cliente, así que un atacante puede subir
 * cualquier archivo (un script, un polyglot) etiquetado como `image/png`.
 * Este puerto no confía en esa declaración: decodifica el archivo como
 * imagen de verdad (por sus bytes) y lo re-codifica desde cero, lo que
 * garantiza que lo que se guarda es una imagen rasterizada válida y
 * descarta cualquier payload adicional que un polyglot pudiera llevar
 * después de los datos de imagen.
 */
export interface ImageProcessorPort {
  /**
   * @throws si el buffer no decodifica como una imagen soportada, o
   * excede los límites de dimensiones/píxeles configurados.
   */
  sanitize(buffer: Buffer): Promise<SanitizedImage>;
}
