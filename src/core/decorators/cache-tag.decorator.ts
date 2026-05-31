import { SetMetadata } from '@nestjs/common';

export const CacheTag = (tag: string) => SetMetadata('cache-tag', tag);
