import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@prisma/prisma/prisma.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'supersecretaccess',
      ignoreExpiration: false,
    });

    // Debug: cek secret yang dipakai
    console.log(
      'JwtStrategy initialized with secret:',
      process.env.JWT_ACCESS_SECRET || 'supersecretaccess',
    );
  }

  async validate(payload: any) {
    console.log('JwtStrategy.validate() called with payload:', payload);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true },
    });

    console.log(
      'User found:',
      user
        ? `${user.email} (${user.roles?.map((role) => role.name).join(', ')})`
        : 'null',
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const result = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map((role) => role.name),
    };

    console.log('JwtStrategy returning user:', result);

    return result;
  }
}
