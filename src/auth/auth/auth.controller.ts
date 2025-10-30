import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('renew-token')
  refreshToken(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @Post('logout/:userId')
  logout(@Param('userId') userId: string, @Body() data: RefreshTokenDto) {
    return this.authService.logout(userId, data.refreshToken);
  }

  @Post('logout-all-devices/:userId')
  logoutAllDevices(@Param('userId') userId: string) {
    return this.authService.logoutAllDevices(userId);
  }
}
