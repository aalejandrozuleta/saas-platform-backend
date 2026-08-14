/**
 * Puerto para subir imágenes a un storage tipo S3 (MinIO en dev, S3/R2 en
 * prod — misma interfaz, solo cambia el endpoint/credenciales).
 */
export interface ImageStoragePort {
  /**
   * Sube un archivo y devuelve su URL pública.
   *
   * @param key - Ruta/nombre del objeto dentro del bucket (ej. `avatars/{userId}.jpg`).
   * @param body - Contenido del archivo.
   * @param contentType - MIME type (ej. `image/png`).
   */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;
}
