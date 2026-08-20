import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { Prisma } from '@prisma/client';

function toResponse(task: any) {
  return {
    ...task,
    tags: task.tags ? JSON.parse(task.tags) : [],
  };
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    const data: Prisma.TaskCreateInput = {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      status: (dto.status as any) || 'TODO',
      priority: (dto.priority as any) || 'MEDIUM',
      category: dto.category?.trim() || null,
      tags: dto.tags ? JSON.stringify(dto.tags) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      order: dto.order ?? 0,
      user: { connect: { id: userId } },
    };
    const task = await this.prisma.task.create({ data });
    return toResponse(task);
  }

  async findAll(userId: string, query: QueryTaskDto) {
    const where: Prisma.TaskWhereInput = { userId };
    if (query.status) where.status = query.status as any;
    if (query.category) where.category = query.category;
    if (query.priority) where.priority = query.priority as any;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const sortBy = ['createdAt', 'dueDate', 'priority', 'title', 'order', 'updatedAt'].includes(query.sortBy || '')
      ? query.sortBy!
      : 'order';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    // priority custom ordering not natively sortable; default to order/createdAt
    const orderBy: Prisma.TaskOrderByWithRelationInput =
      sortBy === 'priority' ? { priority: sortOrder } : { [sortBy]: sortOrder } as any;

    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10) || 50));
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({ where, orderBy: [orderBy, { createdAt: 'desc' }], skip, take: limit }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks.map(toResponse),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return toResponse(task);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(userId, id);
    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.status !== undefined) data.status = dto.status as any;
    if (dto.priority !== undefined) data.priority = dto.priority as any;
    if (dto.category !== undefined) data.category = dto.category?.trim() || null;
    if (dto.tags !== undefined) data.tags = dto.tags ? JSON.stringify(dto.tags) : null;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.order !== undefined) data.order = dto.order;

    const updated = await this.prisma.task.update({ where: { id }, data });
    return toResponse(updated);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.task.delete({ where: { id } });
    return { deleted: true };
  }

  async bulkUpdate(userId: string, ids: string[], status: string) {
    const result = await this.prisma.task.updateMany({
      where: { id: { in: ids }, userId },
      data: { status: status as any },
    });
    return { updated: result.count };
  }

  async reorder(userId: string, orderedIds: string[]) {
    // simple sequential reorder
    const ops = orderedIds.map((id, index) =>
      this.prisma.task.updateMany({ where: { id, userId }, data: { order: index } }),
    );
    await this.prisma.$transaction(ops);
    return { reordered: true };
  }

  async stats(userId: string) {
    const [total, todo, inProgress, done, high] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, status: 'TODO' } }),
      this.prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { userId, status: 'DONE' } }),
      this.prisma.task.count({ where: { userId, priority: 'HIGH' } }),
    ]);
    return { total, todo, inProgress, done, highPriority: high };
  }
}
