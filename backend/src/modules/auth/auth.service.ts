import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async guestLogin(username?: string) {
    const baseName = (username?.trim() || `Guest_${uuidv4().slice(0, 6)}`).slice(0, 30);
    // ensure uniqueness
    let finalName = baseName;
    const exists = await this.prisma.user.findUnique({ where: { username: finalName } });
    if (exists) {
      finalName = `${baseName}_${uuidv4().slice(0, 4)}`;
    }

    const user = await this.prisma.user.create({
      data: { username: finalName, isGuest: true },
    });

    const payload = { sub: user.id, username: user.username, isGuest: true };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: { id: user.id, username: user.username, isGuest: user.isGuest },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return { id: user.id, username: user.username, isGuest: user.isGuest, createdAt: user.createdAt };
  }
}
