import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('tasks/:taskId/comments')
export class CommentsController {
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
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    await this.ensureOwner(user.id, taskId);
    return this.prisma.comment.create({
      data: {
        body: dto.body.trim(),
        author: dto.author.trim(),
        task: { connect: { id: taskId } },
      },
    });
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: { id: string },
    @Param('taskId') taskId: string,
    @Param('id') id: string,
  ) {
    await this.ensureOwner(user.id, taskId);
    await this.prisma.comment.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureOwner(userId: string, taskId: string) {
    const t = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!t) throw new NotFoundException('Task not found');
  }
}
