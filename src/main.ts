import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Inicializar la aplicación NestJS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Establecer prefijo global para rutas API
  app.setGlobalPrefix('api', {
    exclude: ['/'], // Excluir raíz para servir archivos estáticos
  });

  // Habilitar pipe de validación global con transformación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('UCAB Tasks API')
    .setDescription(
      'API REST para gestión de notas. Desarrollada con NestJS siguiendo Clean Architecture.',
    )
    .setVersion('1.0.0')
    .addTag('Notas', 'Endpoints para gestión de notas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 UCAB Tasks running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
