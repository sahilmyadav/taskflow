import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    if (dto.username) {
      const exists = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
      });
      if (exists) throw new ConflictException('Username taken');
    }
    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (exists) throw new ConflictException('Email taken');
    }
    const data: Prisma.UserUpdateInput = {};
    if (dto.email !== undefined) data.email = dto.email?.trim() || null;
    if (dto.fullName !== undefined)
      data.fullName = dto.fullName?.trim() || null;
    if (dto.title !== undefined) data.title = dto.title?.trim() || null;
    if (dto.username !== undefined) data.username = dto.username.trim();
    if (dto.colorMode !== undefined) data.colorMode = dto.colorMode;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async leaveWorkspace(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { left: true };
  }
}
