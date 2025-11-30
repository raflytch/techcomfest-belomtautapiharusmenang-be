/**
 * @fileoverview Main bootstrap file for Impact2Action NestJS application
 * @description Entry point that configures global prefix, Swagger, validation pipe, and response interceptor
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@commons/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Set global API prefix
   * All routes will be prefixed with /api
   */
  app.setGlobalPrefix('api');

  /**
   * Configure global validation pipe
   * @description Validates and transforms incoming request data
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /**
   * Apply global response interceptor
   * @description Standardizes API response format: { statusCode, message, data, meta? }
   */
  app.useGlobalInterceptors(new ResponseInterceptor());

  /**
   * Configure Swagger API documentation
   * @description Available at /api-docs endpoint
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Impact2Action API')
    .setDescription(
      `
      <p><strong>Sense Every Action, Reward Every Impact</strong></p>
      <p>API documentation untuk aplikasi Impact2Action</p>
      <hr />
      <p>Impact2Action adalah platform untuk mendorong aksi hijau di masyarakat
      dengan memberikan reward berupa voucher dari UMKM lokal.</p>
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Masukkan JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('App', 'Endpoint dasar aplikasi')
    .addTag('Users', 'Manajemen pengguna')
    .addTag('Green Actions', 'Aksi hijau dan verifikasi')
    .addTag('Vouchers', 'Voucher dari UMKM')
    .addTag('Leaderboard', 'Peringkat dan kompetisi')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Impact2Action API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin-bottom: 20px }
      .swagger-ui .info hgroup.main { margin: 0 0 20px 0 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  /**
   * Start the server on configured port
   * @default 3000
   */
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🌱 Impact2Action API Server                             ║
  ║   "Sense Every Action, Reward Every Impact"               ║
  ║                                                           ║
  ╠═══════════════════════════════════════════════════════════╣
  ║                                                           ║
  ║   🚀 Server running on: http://localhost:${port}             ║
  ║   📚 API Docs: http://localhost:${port}/api-docs             ║
  ║   🔗 API Base URL: http://localhost:${port}/api              ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
