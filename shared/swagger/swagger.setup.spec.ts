import { SwaggerModule } from '@nestjs/swagger';

import { setupSwagger } from './swagger.setup';

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      info: { title: 'Test API', version: '1.0.0', description: '' },
      components: {},
    }),
  })),
}));

describe('setupSwagger', () => {
  it('debe llamar a SwaggerModule.createDocument y SwaggerModule.setup', () => {
    const app = {} as any;

    setupSwagger(app, 'Test Service');

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      app,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith('docs', app, expect.any(Object));
  });
});
