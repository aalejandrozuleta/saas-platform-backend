import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import {
  type ImageProcessorPort,
  type SanitizedImage,
} from '@application/ports/image-processor.port';

const ALLOWED_FORMATS = new Set(['png', 'jpeg', 'webp']);

/** Límite de píxeles de entrada (ancho × alto) para frenar decompression bombs. */
const MAX_INPUT_PIXELS = 40_000_000; // 40MP — muy por encima de cualquier avatar real

/** Los avatares no necesitan más resolución que esto. */
const AVATAR_MAX_DIMENSION = 512;
const AVATAR_QUALITY = 85;

/**
 * Implementación de {@link ImageProcessorPort} con `sharp` (libvips).
 *
 * @remarks
 * `sharp(buffer).metadata()` falla si el buffer no es una imagen
 * rasterizada decodificable — esa es la validación real (por bytes, no
 * por el `Content-Type` declarado). SVG queda excluido a propósito: es
 * XML, no un raster, y puede llevar `<script>`/referencias externas.
 *
 * Toda imagen aceptada se re-codifica a WEBP y se reduce a un tamaño de
 * avatar fijo — esto normaliza el storage a un solo formato/tamaño y,
 * como el re-encode solo preserva los píxeles decodificados, cualquier
 * dato adicional que un archivo "polyglot" llevara pegado después de la
 * imagen real se descarta.
 */
@Injectable()
export class SharpImageProcessorService implements ImageProcessorPort {
  async sanitize(buffer: Buffer): Promise<SanitizedImage> {
    try {
      const image = sharp(buffer, {
        limitInputPixels: MAX_INPUT_PIXELS,
        failOn: 'error',
        animated: false,
      });

      const metadata = await image.metadata();

      if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
        throw new Error(`UNSUPPORTED_IMAGE_FORMAT:${metadata.format ?? 'unknown'}`);
      }

      const output = await image
        .resize(AVATAR_MAX_DIMENSION, AVATAR_MAX_DIMENSION, {
          fit: 'cover',
          withoutEnlargement: true,
        })
        .webp({ quality: AVATAR_QUALITY })
        .toBuffer();

      return {
        buffer: output,
        contentType: 'image/webp',
        extension: 'webp',
      };
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('UNSUPPORTED_IMAGE_FORMAT')) {
        throw error;
      }

      throw new Error('UNSUPPORTED_IMAGE_FORMAT:undecodable');
    }
  }
}
