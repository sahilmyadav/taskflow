// Vercel serverless entry point. Vercel invokes the default export per request.
import type { IncomingMessage, ServerResponse } from 'http';
import type { INestApplication } from '@nestjs/common';
import { createApp } from '../src/bootstrap';

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

// Cache the app across invocations on a warm instance. The in-flight promise is
// cached too, so concurrent cold requests build the app once instead of racing.
let cachedApp: INestApplication | null = null;
let pendingApp: Promise<INestApplication> | null = null;

function getApp(): Promise<INestApplication> {
  if (cachedApp) return Promise.resolve(cachedApp);
  pendingApp ??= createApp()
    .then(async (app) => {
      await app.init();
      cachedApp = app;
      return app;
    })
    .catch((err) => {
      pendingApp = null; // let the next request retry a failed cold start
      throw err;
    });
  return pendingApp;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const app = await getApp();
  const instance = app.getHttpAdapter().getInstance() as NodeHandler;
  return instance(req, res);
}
