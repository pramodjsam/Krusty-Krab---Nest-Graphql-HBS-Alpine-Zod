import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { buildHash } from 'src/utils/cache.util';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async invalidateTag(tag: string, args: Record<string, any> = {}) {
    const hash = buildHash(tag, args);

    await this.cacheManager.del(`gql:${tag}:${hash}`);
  }
}
