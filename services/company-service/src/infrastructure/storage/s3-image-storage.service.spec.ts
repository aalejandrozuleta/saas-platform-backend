import { type EnvService } from '@config/env/env.service';

import { S3ImageStorageService } from './s3-image-storage.service';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: sendMock })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

describe('S3ImageStorageService', () => {
  let service: S3ImageStorageService;
  let envService: jest.Mocked<EnvService>;

  beforeEach(() => {
    sendMock.mockReset().mockResolvedValue({});

    envService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          STORAGE_ENDPOINT: 'http://localhost:9000',
          STORAGE_REGION: 'us-east-1',
          STORAGE_BUCKET: 'company-logos',
          STORAGE_ACCESS_KEY: 'access-key',
          STORAGE_SECRET_KEY: 'secret-key',
          STORAGE_PUBLIC_URL: 'http://localhost:9000/company-logos',
        };
        return values[key];
      }),
    } as unknown as jest.Mocked<EnvService>;

    service = new S3ImageStorageService(envService);
  });

  describe('upload', () => {
    it('debe subir el objeto y devolver la URL pública', async () => {
      const url = await service.upload('logos/c-1.png', Buffer.from('img'), 'image/png');

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(url).toBe('http://localhost:9000/company-logos/logos/c-1.png');
    });
  });
});
