import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================
  // GLOBAL VALIDATION
  // =========================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // =========================
  // CORS
  // =========================
  app.enableCors({
  origin: [
  'https://glowbook-mauve.vercel.app',
],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  // =========================
  // SWAGGER
  // =========================
  const config = new DocumentBuilder()
    .setTitle('GlowBook API')
    .setDescription(
      'Salon booking and management API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup('api', app, document);

  // =========================
  // START SERVER
  // =========================
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
