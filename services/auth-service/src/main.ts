import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  console.log('hola');
  
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Auth Service running on port ${process.env.PORT}`);
}
bootstrap();
