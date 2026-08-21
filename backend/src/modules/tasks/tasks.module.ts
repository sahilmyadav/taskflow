import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SubtasksController } from './subtasks.controller';
import { CommentsController } from './comments.controller';

@Module({
  controllers: [TasksController, SubtasksController, CommentsController],
  providers: [TasksService],
})
export class TasksModule {}
