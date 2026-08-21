import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get()
  root() {
    return {
      name: 'Task Management API',
      version: '1.0.0',
      docs: '/api/health',
    };
  }
}
