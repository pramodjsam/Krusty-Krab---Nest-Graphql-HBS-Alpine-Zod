import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserPayload } from 'src/modules/user/interfaces/user-payload.interface';
import { extractTokenFromHeader } from 'src/utils/token.util';
import { Role } from '../constants';

export class CanModifyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request: Request = ctx.getContext().request;

    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('User not authorized');
    }

    const payload: UserPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('jwt.secret'),
    });

    request.user = payload;
    const userIdFromRequest = ctx.getArgs()?.userId;

    if (
      payload.role === Role.ADMIN ||
      (userIdFromRequest && userIdFromRequest === payload.id)
    ) {
      return true;
    }

    throw new ForbiddenException('Forbidden');
  }
}
