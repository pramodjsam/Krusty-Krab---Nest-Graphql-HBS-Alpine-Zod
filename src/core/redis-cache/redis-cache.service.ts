import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Redis } from 'ioredis';
import { buildHash } from 'src/utils/cache.util';
import { REDIS_CLIENT } from '../constants/index';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getKeys(pattern: string = '*') {
    return this.redis.keys(pattern);
  }

  async invalidateCacheForService(service: string, id?: number) {
    if (id !== undefined) {
      await this.invalidateTag(`${service}:detail`, { id });
    }

    await this.invalidateAllListForTag(`${service}:list`);
  }

  async invalidateTag(tag: string, args: Record<string, any> = {}) {
    const hash = buildHash(tag, args);

    await this.cacheManager.del(`gql:${tag}:${hash}`);
  }

  async invalidateAllListForTag(tag: string) {
    const pattern = `gql:${tag}:*`;

    const stream = this.redis.scanStream({
      match: pattern,
      count: 100,
    });

    const keys: string[] = [];

    for await (const chunk of stream) {
      keys.push(...chunk);
    }

    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}
