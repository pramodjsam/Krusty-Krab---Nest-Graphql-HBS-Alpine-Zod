import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../constants/index';

export const RedisClientProvider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    return new Redis('redis://127.0.0.1:6380'); // Move to env
  },
};
