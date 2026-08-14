import sharp from 'sharp';

import { SharpImageProcessorService } from './sharp-image-processor.service';

describe('SharpImageProcessorService', () => {
  let service: SharpImageProcessorService;

  beforeEach(() => {
    service = new SharpImageProcessorService();
  });

  const makePng = async (width = 800, height = 600) =>
    sharp({
      create: { width, height, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();

  describe('sanitize', () => {
    it('debe aceptar un PNG válido y re-codificarlo a WEBP', async () => {
      const png = await makePng();

      const result = await service.sanitize(png);

      expect(result.contentType).toBe('image/webp');
      expect(result.extension).toBe('webp');

      const outputMeta = await sharp(result.buffer).metadata();
      expect(outputMeta.format).toBe('webp');
    });

    it('debe reducir imágenes más grandes que el tamaño máximo de avatar', async () => {
      const png = await makePng(2000, 2000);

      const result = await service.sanitize(png);

      const outputMeta = await sharp(result.buffer).metadata();
      expect(outputMeta.width).toBeLessThanOrEqual(512);
      expect(outputMeta.height).toBeLessThanOrEqual(512);
    });

    it('debe aceptar un JPEG válido', async () => {
      const jpeg = await sharp({
        create: { width: 400, height: 400, channels: 3, background: { r: 0, g: 255, b: 0 } },
      })
        .jpeg()
        .toBuffer();

      const result = await service.sanitize(jpeg);

      expect(result.contentType).toBe('image/webp');
    });

    it('debe rechazar un archivo que no es una imagen (spoofing de content-type)', async () => {
      const fakeImage = Buffer.from('%PDF-1.4 esto no es una imagen');

      await expect(service.sanitize(fakeImage)).rejects.toThrow(/UNSUPPORTED_IMAGE_FORMAT/);
    });

    it('debe rechazar un SVG (XML, no un raster — riesgo de script embebido)', async () => {
      const svg = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      );

      await expect(service.sanitize(svg)).rejects.toThrow(/UNSUPPORTED_IMAGE_FORMAT/);
    });

    it('debe rechazar un buffer vacío', async () => {
      await expect(service.sanitize(Buffer.alloc(0))).rejects.toThrow(/UNSUPPORTED_IMAGE_FORMAT/);
    });
  });
});
