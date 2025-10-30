import { UsersService } from '@modules/users/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { JWTPayload } from './types';
import { PrismaService } from '@prisma/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async login(data: LoginDto) {
    const user = await this.validateUser(data.email, data.password);
    const payload: JWTPayload = {
      sub: user.id,
      roles: user.roles.map((role) => role.name),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'supersecretaccess',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefresh',
      expiresIn: '7d',
    });

    await this.usersService.updateUser(user.id, {
      refreshTokens: [...user.refreshTokens, refreshToken],
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map((role) => role.name),
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(oldToken: string) {
    try {
      const decoded: JWTPayload = this.jwtService.verify(oldToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefresh',
      });

      const user = await this.usersService.getUserById(decoded.sub);

      if (!user.refreshTokens.includes(oldToken)) {
        // Token reuse detected!
        await this.usersService.updateUser(user.id, {
          refreshTokens: [],
        });
        throw new UnauthorizedException(
          'Token reuse detected - all sessions terminated',
        );
      }

      const payload: JWTPayload = {
        sub: user.id,
        roles: user.roles.map((role) => role.name),
      };

      const newAccessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'supersecretaccess',
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefresh',
        expiresIn: '7d',
      });

      // Update tokens in database (remove old, add new)
      const updatedTokens = user.refreshTokens
        .filter((token) => token !== oldToken)
        .concat(newRefreshToken);

      await this.usersService.updateUser(user.id, {
        refreshTokens: updatedTokens,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired');
      }

      console.error('Unexpected error in refreshToken:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    const user = await this.usersService.getUserById(userId);

    if (!user.refreshTokens.includes(refreshToken))
      throw new UnauthorizedException('Invalid refresh token');

    await this.usersService.updateUser(userId, {
      refreshTokens: user.refreshTokens.filter(
        (token) => token !== refreshToken,
      ),
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async logoutAllDevices(userId: string) {
    const user = await this.usersService.getUserById(userId);
    const deviceCount = user.refreshTokens.length;

    await this.usersService.updateUser(userId, {
      refreshTokens: [],
    });

    return {
      message: `Logged out from ${deviceCount} devices successfully`,
      userId: userId,
      deviceCount: deviceCount,
    };
  }
}
