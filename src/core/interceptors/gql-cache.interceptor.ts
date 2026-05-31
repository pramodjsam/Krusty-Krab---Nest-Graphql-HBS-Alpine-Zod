import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Cache } from 'cache-manager';
import { from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { buildHash } from 'src/utils/cache.util';

@Injectable()
export class GqlCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const gqlCtx = GqlExecutionContext.create(context);
    const args = gqlCtx.getArgs();
    const tag = this.reflector.get('cache-tag', context.getHandler());

    if (!tag) {
      return next.handle();
    }

    const key = this.createCacheKey(args, tag);

    return from(this.cacheManager.get(key)).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return next.handle().pipe(
          mergeMap(async (response) => {
            await this.cacheManager.set(key, response);

            return response;
          }),
        );
      }),
    );
  }

  private createCacheKey(args: any, tag: string) {
    const hash = buildHash(tag, args);

    return `gql:${tag}:${hash}`;
  }
}
