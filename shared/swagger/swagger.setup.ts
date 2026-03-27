import { type INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { createSwaggerConfig } from './swagger.config';

/**
 * Inicializa Swagger en una aplicación NestJS.
 */
export function setupSwagger(
  app: INestApplication,
  serviceName: string,
) {
  const config = createSwaggerConfig(serviceName);

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
}