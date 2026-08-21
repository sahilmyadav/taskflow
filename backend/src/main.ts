import { ConfigService } from '@nestjs/config';
import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();
  const port = app.get(ConfigService).get<number>('port') || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
}
void bootstrap();
