import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { EnvService } from '@config/env/env.service';
import { type ImageStoragePort } from '@application/ports/image-storage.port';

/**
 * Implementación de {@link ImageStoragePort} contra un storage
 * S3-compatible (MinIO en dev, AWS S3/Cloudflare R2 en prod — el cliente
 * `S3Client` habla el mismo protocolo, solo cambian endpoint/credenciales
 * por variables de entorno).
 */
@Injectable()
export class S3ImageStorageService implements ImageStoragePort {
  private readonly logger = new Logger(S3ImageStorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly envService: EnvService) {
    this.bucket = this.envService.get('STORAGE_BUCKET');
    this.publicUrl = this.envService.get('STORAGE_PUBLIC_URL');

    this.client = new S3Client({
      endpoint: this.envService.get('STORAGE_ENDPOINT'),
      region: this.envService.get('STORAGE_REGION'),
      credentials: {
        accessKeyId: this.envService.get('STORAGE_ACCESS_KEY'),
        secretAccessKey: this.envService.get('STORAGE_SECRET_KEY'),
      },
      // Requerido por MinIO (y la mayoría de S3-compatibles self-hosted);
      // AWS S3 real también lo acepta, así que funciona igual en prod.
      forcePathStyle: true,
    });
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  /**
   * Traduce la URL pública de vuelta a la key del bucket (`upload` la
   * construyó como `${publicUrl}/${key}`) y borra el objeto.
   *
   * @remarks
   * Si la URL no tiene el prefijo esperado (dato corrupto o ya migrado a
   * otro storage), se registra una advertencia y se ignora en vez de
   * fallar — borrar el logo nunca debería bloquearse por un dato legacy
   * inconsistente.
   */
  async deleteByUrl(url: string): Promise<void> {
    const prefix = `${this.publicUrl}/`;

    if (!url.startsWith(prefix)) {
      this.logger.warn(`URL de logo con formato inesperado, no se borra del storage: ${url}`);
      return;
    }

    const key = url.slice(prefix.length);

    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
