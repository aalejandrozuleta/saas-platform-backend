import { createSwaggerConfig } from './swagger.config';

describe('createSwaggerConfig', () => {
  it('debe crear config con el nombre del servicio', () => {
    const config = createSwaggerConfig('Auth Service');

    expect(config.info.title).toBe('Auth Service API');
    expect(config.info.description).toContain('Auth Service');
    expect(config.info.version).toBe('1.0.0');
  });

  it('debe aceptar versión personalizada', () => {
    const config = createSwaggerConfig('Gateway', '2.5.0');

    expect(config.info.version).toBe('2.5.0');
  });

  it('debe incluir esquema Bearer para autenticación', () => {
    const config = createSwaggerConfig('Test Service');

    // La configuración de components contiene los security schemes
    expect(config.components?.securitySchemes).toBeDefined();
    expect(config.components!.securitySchemes!['access-token']).toMatchObject({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  });
});
