import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginDto } from './dto/guest-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('guest')
  async guest(@Body() dto: GuestLoginDto) {
    return this.authService.guestLogin(dto.username);
  }

  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }
}
