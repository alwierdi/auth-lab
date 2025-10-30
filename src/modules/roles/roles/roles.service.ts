import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.role.findMany();
  }

  async getRoleById(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: { id },
      // include: {
      //   users: true,
      // },
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async getRolesByName(name: string) {
    const role = await this.prismaService.role.findUnique({
      where: { name },
      include: {
        users: true,
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async createRole(data: CreateRoleDto) {
    return this.prismaService.role.create({
      data,
    });
  }

  async updateRole(id: string, data: UpdateRoleDto) {
    const role = await this.getRoleById(id);
    if (!role) throw new NotFoundException('Role not found');

    return this.prismaService.role.update({
      where: { id },
      data,
    });
  }

  async removeRole(id: string) {
    const role = await this.getRoleById(id);
    if (!role) throw new NotFoundException('Role not found');

    await this.prismaService.role.delete({
      where: { id },
    });

    return {
      message: 'Role deleted successfully',
    };
  }

  async defaultRole() {
    const defaultRoles = ['ADMIN', 'FINANCE', 'STAFF'];

    for (const roleName of defaultRoles) {
      const exists = await this.prismaService.role.findUnique({
        where: { name: roleName },
      });

      if (!exists) {
        await this.prismaService.role.create({
          data: {
            name: roleName,
          },
        });
      }
    }

    // return {
    //   message: 'Default roles created successfully',
    // };
  }
}
