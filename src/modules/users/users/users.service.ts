import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
  }

  async createUser(data: CreateUserDto): Promise<{ message: string } & User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        roles: {
          connect: data.roles.map((id) => ({ id })),
        },
      },
      include: {
        roles: true,
      },
    });
    return {
      message: 'User created successfully',
      ...user,
    };
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<{ message: string } & User> {
    const user = await this.getUserById(id);
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {
      email: data.email,
      fullName: data.fullName,
      isActive: data.isActive,
      password: data.password
        ? await bcrypt.hash(data.password, 10)
        : undefined,
      refreshTokens: data.refreshTokens,
    };

    if (data.roles && data.roles.length > 0) {
      updateData.roles = {
        connect: data.roles.map((id) => ({ id })),
      };
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateData,
      include: { roles: true },
    });

    return {
      message: 'User updated successfully',
      ...updatedUser,
    };
  }

  async removeUser(id: string) {
    const user = await this.getUserById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.prismaService.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
