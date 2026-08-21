import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';

/** True when Prisma rejected a write because of a unique constraint. */
function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
  );
}

export const GUEST_LIMITS = {
  maxTasks: 10,
  maxProjects: 3,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async guestLogin(username?: string) {
    const baseName = (
      username?.trim() || `Guest_${randomUUID().slice(0, 6)}`
    ).slice(0, 30);

    // The check-then-create below races with concurrent guest logins, and the
    // suffix can itself collide, so retry on a unique violation instead of
    // surfacing a 500.
    let user: User | null = null;
    for (let attempt = 0; attempt < 4 && !user; attempt++) {
      const candidate =
        attempt === 0
          ? baseName
          : `${baseName.slice(0, 25)}_${randomUUID().slice(0, 4)}`;
      const taken = await this.prisma.user.findUnique({
        where: { username: candidate },
      });
      if (taken) continue;
      try {
        user = await this.prisma.user.create({
          data: {
            username: candidate,
            isGuest: true,
            avatarUrl: '/guest-avatar.png',
          },
        });
      } catch (e) {
        if (!isUniqueViolation(e)) throw e;
      }
    }
    if (!user) {
      throw new ConflictException(
        'Could not allocate a guest name, please try again',
      );
    }

    const payload = { sub: user.id, username: user.username, isGuest: true };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        isGuest: user.isGuest,
        avatarUrl: user.avatarUrl,
        email: null,
      },
    };
  }

  async register(dto: {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
  }) {
    const email = dto.email.trim().toLowerCase();
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) throw new ConflictException('Email already registered');

    let username = dto.username?.trim() || email.split('@')[0];
    username = username.slice(0, 30);
    // ensure username unique
    let finalUsername = username;
    const existsName = await this.prisma.user.findUnique({
      where: { username: finalUsername },
    });
    if (existsName) finalUsername = `${username}_${randomUUID().slice(0, 4)}`;

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let user: User;
    try {
      user = await this.prisma.user.create({
        data: {
          username: finalUsername,
          email,
          passwordHash,
          fullName: dto.fullName?.trim() || null,
          isGuest: false,
          avatarUrl: null,
        },
      });
    } catch (e) {
      // Another request may have taken the email or username between the
      // lookups above and this insert.
      if (isUniqueViolation(e)) {
        throw new ConflictException('Email or username already registered');
      }
      throw e;
    }

    const payload = { sub: user.id, username: user.username, isGuest: false };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isGuest: user.isGuest,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async login(dto: { email: string; password: string }) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const payload = { sub: user.id, username: user.username, isGuest: false };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isGuest: user.isGuest,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    // include quota for guests
    let quota: { maxTasks: number; maxProjects: number } | null = null;
    let usage: { tasks: number; projects: number } | null = null;
    if (user.isGuest) {
      quota = { ...GUEST_LIMITS };
      const [tasks, projects] = await Promise.all([
        this.prisma.task.count({ where: { userId } }),
        this.prisma.project.count({ where: { userId } }),
      ]);
      usage = { tasks, projects };
    }
    return {
      id: user.id,
      username: user.username,
      isGuest: user.isGuest,
      email: user.email,
      fullName: user.fullName,
      title: user.title,
      avatarUrl: user.avatarUrl,
      colorMode: user.colorMode,
      createdAt: user.createdAt,
      quota,
      usage,
    };
  }
}
