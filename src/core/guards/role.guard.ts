import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/role.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserPayload } from 'src/modules/user/interfaces/user-payload.interface';
import { Role } from '../constants';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles: Role[] = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const ctx = GqlExecutionContext.create(context);
    const user: UserPayload = ctx.getContext().req?.user;

    if (!user) {
      throw new UnauthorizedException('Not Authorized');
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
