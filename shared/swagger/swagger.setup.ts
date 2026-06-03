import { type INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

import { createSwaggerConfig } from './swagger.config';

/**
 * Inicializa Swagger en una aplicación NestJS.
 *
 * @param app - Instancia de la aplicación NestJS. Se acepta `any` en el
 *   parámetro de la función para evitar conflictos de tipos cuando el
 *   paquete shared y el servicio consumidor resuelven versiones distintas
 *   de `class-validator` como peer dependency de `@nestjs/common`.
 * @param serviceName - Nombre del servicio que aparece en la UI de Swagger.
 */
 
export function setupSwagger(app: any, serviceName: string): void {
  const config = createSwaggerConfig(serviceName);

  const document = SwaggerModule.createDocument(app as INestApplication, config);

  SwaggerModule.setup('docs', app as INestApplication, document);
}
