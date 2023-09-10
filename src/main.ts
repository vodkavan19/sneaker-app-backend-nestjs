import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ 
    credentials: true, 
    origin: process.env.URL_FRONTEND_SERVER
  })
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  
  await app.listen(process.env.APP_PORT);
}
bootstrap();
