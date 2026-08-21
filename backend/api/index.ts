// Vercel serverless entry point for NestJS
// Vercel will call the default export as a Node.js serverless function.
// We cache the Nest app between invocations (warm Lambda) to avoid cold boot overhead.

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

let cachedApp: any = null;

async function createApp() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('frontendUrl');

  app.use(helmet());
  app.use(cookieParser());

  // In production on Vercel, allow the deployed frontend URL.
  // You can also set FRONTEND_URL to "*" during testing, but prefer exact origin.
  const allowedOrigins = [
    frontendUrl || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, health checks)
      if (!origin) return cb(null, true);
      // Allow any vercel.app subdomain if FRONTEND_URL not set explicitly
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return cb(null, true);
      }
      return cb(null, true); // be permissive for now; tighten after you set FRONTEND_URL
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');
  await app.init();
  return app;
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  const instance = cachedApp.getHttpAdapter().getInstance();
  return instance(req, res);
}
