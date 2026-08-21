import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

type OriginCallback = (err: Error | null, allow?: boolean) => void;

/** Vercel preview deployments, e.g. https://taskflow-abc123.vercel.app */
const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

function corsOrigin(frontendUrl?: string) {
  const allowed = new Set(
    [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'].filter(
      (o): o is string => Boolean(o),
    ),
  );

  return (origin: string | undefined, cb: OriginCallback) => {
    // No Origin header: same-origin navigations, curl, health checks.
    if (!origin) return cb(null, true);
    if (allowed.has(origin)) return cb(null, true);
    if (VERCEL_PREVIEW.test(origin)) return cb(null, true);
    return cb(null, false);
  };
}

/**
 * Builds the application with the middleware, CORS policy, validation and
 * route prefix that every entry point needs. `main.ts` calls listen() on it;
 * the serverless handler in api/ calls init() and reuses the Express instance,
 * so both stay on exactly one configuration.
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigin(config.get<string>('frontendUrl')),
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
  return app;
}
