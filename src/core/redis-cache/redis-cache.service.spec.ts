import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RedisCacheService } from './redis-cache.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { buildHash } from 'src/utils/cache.util';

jest.mock('src/utils/cache.util', () => ({
  buildHash: jest.fn(),
}));

describe('RedisCacheService', () => {
  let redisCacheService: RedisCacheService;
  let cacheManager: DeepMocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
    cacheManager = module.get(CACHE_MANAGER);
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
});
