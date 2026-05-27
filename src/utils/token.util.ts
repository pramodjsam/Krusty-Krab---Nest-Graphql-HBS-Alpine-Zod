import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/modules/user/entities/user.entity';
import { UserPayload } from 'src/modules/user/interfaces/user-payload.interface';

export const generateToken = async (user: User, jwtService: JwtService) => {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return await jwtService.signAsync(payload);
};

export const extractTokenFromHeader = (request: Request) => {
  const [type, token] = request.headers?.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

export const generatePasswordResetToken = () => {
  return Math.floor(Math.random() * (10000 - 1000) + 1000);
};
