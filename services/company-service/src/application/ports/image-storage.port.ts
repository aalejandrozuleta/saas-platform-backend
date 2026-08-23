/**
 * Puerto para subir imágenes a un storage tipo S3 (MinIO en dev, S3/R2 en
 * prod — misma interfaz, solo cambia el endpoint/credenciales).
 */
export interface ImageStoragePort {
  /**
   * Sube un archivo y devuelve su URL pública.
   *
   * @param key - Ruta/nombre del objeto dentro del bucket (ej. `logos/{companyId}.jpg`).
   * @param body - Contenido del archivo.
   * @param contentType - MIME type (ej. `image/png`).
   */
  upload(key: string, body: Buffer, contentType: string): Promise<string>;

  /**
   * Elimina el objeto correspondiente a una URL pública previamente
   * devuelta por `upload`. La traducción de URL pública a key del bucket es
   * responsabilidad de la implementación (para que el dominio nunca dependa
   * del formato de `STORAGE_PUBLIC_URL`).
   */
  deleteByUrl(url: string): Promise<void>;
}
