import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RedisCacheService } from './redis-cache.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { buildHash } from 'src/utils/cache.util';
import { Redis, ScanStream } from 'ioredis';
import { REDIS_CLIENT } from '../constants/index';

jest.mock('src/utils/cache.util', () => ({
  buildHash: jest.fn(),
}));

describe('RedisCacheService', () => {
  let redisCacheService: RedisCacheService;
  let cacheManager: DeepMocked<Cache>;
  let redisClient: DeepMocked<Redis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
        {
          provide: REDIS_CLIENT,
          useValue: createMock<Redis>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
    cacheManager = module.get(CACHE_MANAGER);
    redisClient = module.get(REDIS_CLIENT);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(redisCacheService).toBeDefined();
  });

  describe('invalidateTag', () => {
    it('should hash the tag and invalidate cache', async () => {
      // Arrange
      (buildHash as jest.Mock).mockReturnValue('fake-hash');

      // Act
      await redisCacheService.invalidateTag('tag');

      // Assert
      expect(buildHash).toHaveBeenCalled();
      expect(buildHash).toHaveBeenCalledWith('tag', {});
      expect(cacheManager.del).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith(`gql:tag:fake-hash`);
    });
  });

  describe('invalidateAllListForTag', () => {
    it('should invalidate all cache with the tag pattern', async () => {
      // Arrange
      const fakeKeys = [
        ['gql:category:list:hash1', 'gql:category:list:hash2'],
        ['gql:category:list:hash3'],
      ];
      redisClient.scanStream.mockReturnValue(mockScanStream(fakeKeys));
      redisClient.del.mockResolvedValue(3);

      // Act
      await redisCacheService.invalidateAllListForTag('category:list');

      // Assert
      expect(redisClient.del).toHaveBeenCalledTimes(1);
      expect(redisClient.del).toHaveBeenCalledWith(
        'gql:category:list:hash1',
        'gql:category:list:hash2',
        'gql:category:list:hash3',
      );
    });
  });

  describe('invalidateCacheForService', () => {
    it('should call invalidateTag and invalidateAllListForTag when id is provided', async () => {
      // Arrange
      const tagSpy = jest
        .spyOn(redisCacheService, 'invalidateTag')
        .mockResolvedValue(undefined);
      const listSpy = jest
        .spyOn(redisCacheService, 'invalidateAllListForTag')
        .mockResolvedValue(undefined);

      // Act
      await redisCacheService.invalidateCacheForService('category', 123);

      // Assert
      expect(tagSpy).toHaveBeenCalledTimes(1);
      expect(tagSpy).toHaveBeenCalledWith('category:detail', { id: 123 });
      expect(listSpy).toHaveBeenCalledTimes(1);
      expect(listSpy).toHaveBeenCalledWith('category:list');
    });

    it('should only call invalidateAllListForTag when id is not provided', async () => {
      // Arrange
      const tagSpy = jest
        .spyOn(redisCacheService, 'invalidateTag')
        .mockResolvedValue(undefined);
      const listSpy = jest
        .spyOn(redisCacheService, 'invalidateAllListForTag')
        .mockResolvedValue(undefined);

      // Act
      await redisCacheService.invalidateCacheForService('category');

      // Assert
      expect(tagSpy).not.toHaveBeenCalled();
      expect(listSpy).toHaveBeenCalledTimes(1);
      expect(listSpy).toHaveBeenCalledWith('category:list');
    });
  });
});

function mockScanStream(chunks: string[][]) {
  let i = 0;
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  } as unknown as ScanStream;
}
