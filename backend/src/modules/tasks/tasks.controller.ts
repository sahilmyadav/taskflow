import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { BulkStatusDto } from './dto/bulk-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(user.id, query);
  }

  @Get('stats')
  stats(@CurrentUser() user: { id: string }) {
    return this.tasksService.stats(user.id);
  }

  @Patch('bulk/status')
  bulkStatus(@CurrentUser() user: { id: string }, @Body() body: BulkStatusDto) {
    return this.tasksService.bulkUpdate(user.id, body.ids, body.status);
  }

  @Patch('reorder')
  reorder(
    @CurrentUser() user: { id: string },
    @Body() body: { orderedIds: string[] },
  ) {
    return this.tasksService.reorder(user.id, body.orderedIds);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.tasksService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.tasksService.remove(user.id, id);
  }
}
