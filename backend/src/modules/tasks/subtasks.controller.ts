import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { Prisma } from '@prisma/client';

@Controller('tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(
    @CurrentUser() user: { id: string },
    @Param('taskId') taskId: string,
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
    });
    if (!task) return [];
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    await this.ensureOwner(user.id, taskId);
    return this.prisma.subtask.create({
      data: {
        title: dto.title.trim(),
        priority: dto.priority ?? 'MEDIUM',
        assignee: dto.assignee?.trim() || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        task: { connect: { id: taskId } },
      },
    });
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateSubtaskDto>,
  ) {
    await this.ensureOwner(user.id, taskId);
    const data: Prisma.SubtaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.assignee !== undefined)
      data.assignee = dto.assignee?.trim() || null;
    if (dto.dueDate !== undefined)
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    return this.prisma.subtask.update({ where: { id }, data });
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('taskId') taskId: string,
    @Param('id') id: string,
  ) {
    await this.ensureOwner(user.id, taskId);
    await this.prisma.subtask.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureOwner(userId: string, taskId: string) {
    const t = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!t) throw new NotFoundException('Task not found');
  }
}
