import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { USER_PUBLIC_SELECT } from './user.select';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    });
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    if (dto.username) {
      const exists = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
      });
      if (exists) throw new ConflictException('Username taken');
    }
    // Registration stores emails lower-cased and login looks them up the same
    // way, so normalise here too — otherwise changing an address to a different
    // casing creates an account that can never be logged into.
    const email = dto.email?.trim().toLowerCase();
    if (email) {
      const exists = await this.prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (exists) throw new ConflictException('Email taken');
    }
    const data: Prisma.UserUpdateInput = {};
    if (dto.email !== undefined) data.email = email || null;
    if (dto.fullName !== undefined)
      data.fullName = dto.fullName?.trim() || null;
    if (dto.title !== undefined) data.title = dto.title?.trim() || null;
    if (dto.username !== undefined) data.username = dto.username.trim();
    if (dto.colorMode !== undefined) data.colorMode = dto.colorMode;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_PUBLIC_SELECT,
    });
  }

  async leaveWorkspace(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { left: true };
  }
}
