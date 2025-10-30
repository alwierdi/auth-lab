import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { ResponseMessage } from 'src/common/interceptors/base-response/base-response';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get('list')
  findAll() {
    return this.rolesService.getAll();
  }

  @Get('list/:id')
  findOne(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Post('create')
  create(@Body() data: CreateRoleDto) {
    return this.rolesService.createRole(data);
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.rolesService.removeRole(id);
  }

  @ResponseMessage('Default role created successfully')
  @Post('seed')
  seedDefaults() {
    return this.rolesService.defaultRole();
  }
}
