import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginDto } from './dto/guest-login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }
}
