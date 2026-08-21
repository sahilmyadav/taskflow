import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { Prisma } from '@prisma/client';
import { GUEST_LIMITS } from '../auth/auth.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.isGuest) {
      const count = await this.prisma.project.count({ where: { userId } });
      if (count >= GUEST_LIMITS.maxProjects) {
        throw new ForbiddenException(
          `Guest limit reached: max ${GUEST_LIMITS.maxProjects} projects. Create an account for unlimited projects.`,
        );
      }
    }
    const data: Prisma.ProjectCreateInput = {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      priority: dto.priority ?? 'MEDIUM',
      lead: dto.lead?.trim() || null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      user: { connect: { id: userId } },
    };
    return this.prisma.project.create({ data });
  }

  async findAll(userId: string, query: QueryProjectDto) {
    const where: Prisma.ProjectWhereInput = { userId };
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }
    return this.prisma.project.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: { subtasks: true, comments: true },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(userId, id);
    const data: Prisma.ProjectUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description?.trim() || null;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.lead !== undefined) data.lead = dto.lead?.trim() || null;
    if (dto.dueDate !== undefined)
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }
}
