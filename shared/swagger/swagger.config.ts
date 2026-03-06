import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Crea la configuración base de Swagger para todos los microservicios.
 */
export function createSwaggerConfig(
  serviceName: string,
  version = '1.0.0',
) {
  return new DocumentBuilder()
    .setTitle(`${serviceName} API`)
    .setDescription(`Documentación del servicio ${serviceName}`)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
}