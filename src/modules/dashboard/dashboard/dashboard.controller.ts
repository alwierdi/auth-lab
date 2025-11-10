import { RolesGuard } from '@modules/roles/guards/roles/roles.guard';
import { Roles } from '@modules/roles/role.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard/jwt-auth.guard';

// @UseGuards(AuthGuard('jwt'), RolesGuard)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'FINANCE'])
@Controller('dashboard')
export class DashboardController {
  constructor() {}

  @Get()
  dailySales() {
    return {
      data: 'Daily sales',
    };
  }
}
