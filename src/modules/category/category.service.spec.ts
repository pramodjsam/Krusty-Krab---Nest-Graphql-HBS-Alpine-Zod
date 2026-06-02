import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CategoryService } from './category.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { ImageService } from '../image/image.service';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Image } from '../image/entities/image.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { streamToBase64Image } from 'src/utils/file.util';
import { NotFoundException } from '@nestjs/common';
import { RedisCacheService } from 'src/core/redis-cache/redis-cache.service';
import { Paginated, PaginateQuery, paginate } from 'nestjs-paginate';

jest.mock('src/utils/file.util', () => ({
  streamToBase64Image: jest.fn(),
}));

jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: DeepMocked<Repository<Category>>;
  let imageService: DeepMocked<ImageService>;
  let cloudinaryService: DeepMocked<CloudinaryService>;
  let dataSource: DeepMocked<DataSource>;
  let queryRunner: DeepMocked<QueryRunner>;
  let redisCacheService: DeepMocked<RedisCacheService>;

  let mockImage: Image;
  let mockCategory: Category;
  let mockCategoryWithoutImage: Category;
  let mockFile: any;
  let createCategoryDto: CreateCategoryDto;
  let mockBase64: string;
  let mockCategoryResponse: Paginated<Category>;

  beforeEach(async () => {
    mockImage = {
      id: 1,
      url: 'http://image.com/img.png',
      publicId: 'public-id',
      version: 1,
    };
    mockCategory = {
      id: 1,
      name: 'Electronics',
      image: mockImage,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCategoryResponse = {
      data: [mockCategory],
      meta: {
        itemsPerPage: 5,
        totalItems: 1,
        currentPage: 1,
        totalPages: 1,
        sortBy: [['id', 'DESC']], // matches your paginate config
        searchBy: ['name'], // whichever columns are searchable
        search: '', // empty string if no search applied
        select: ['id', 'name'], // columns selected, optional but required in TS
      },
      links: {
        first: undefined,
        previous: undefined,
        next: undefined,
        last: undefined,
        current: '',
      },
    };
    mockCategoryWithoutImage = {
      id: 1,
      name: 'Electronics',
      image: undefined,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFile = {
      createReadStream: jest.fn(),
      mimetype: 'image/png',
    } as any;
    createCategoryDto = {
      name: 'Electronics',
    };
    mockBase64 = 'base64-image';

    queryRunner = createMock<QueryRunner>();

    dataSource = createMock<DataSource>();
    dataSource.createQueryRunner.mockReturnValue(queryRunner);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: createMock<Repository<Category>>(),
        },
        {
          provide: ImageService,
          useValue: createMock<ImageService>(),
        },
        {
          provide: CloudinaryService,
          useValue: createMock<CloudinaryService>(),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: RedisCacheService,
          useValue: createMock<RedisCacheService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(getRepositoryToken(Category));
    imageService = module.get(ImageService);
    cloudinaryService = module.get(CloudinaryService);
    redisCacheService = module.get(RedisCacheService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  describe('create()', () => {
    it('should create category and upload image', async () => {
      // Arrange
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      imageService.upload.mockResolvedValue(mockImage);
      categoryRepository.save.mockResolvedValue(mockCategory);

      // Act
      const result = await categoryService.create(createCategoryDto, mockFile);

      // Assert
      expect(streamToBase64Image).toHaveBeenCalledWith(
        mockFile.createReadStream(),
        mockFile.mimetype,
      );
      expect(imageService.upload).toHaveBeenCalledWith(mockBase64);
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should not call image service if there is no file', async () => {
      // Arrange
      categoryRepository.save.mockResolvedValue(mockCategoryWithoutImage);

      // Act
      const result = await categoryService.create(createCategoryDto);

      // Assert
      expect(imageService.upload).not.toHaveBeenCalledWith(mockBase64);
      expect(imageService.upload).not.toHaveBeenCalled();
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategoryWithoutImage);
    });
  });

  describe('findAll()', () => {
    it('should return all categories', async () => {
      // Arrange
      const mockPaginatedQuery: PaginateQuery = {
        page: 1,
        path: '',
      };
      (paginate as jest.Mock).mockResolvedValue(mockCategoryResponse);

      //Act
      const result = await categoryService.findAll(mockPaginatedQuery);

      // Assert
      expect(result).toEqual(mockCategoryResponse);
    });
  });

  describe('findOne()', () => {
    it('should return category by id', async () => {
      //Arrange
      categoryRepository.findOne.mockResolvedValue(mockCategory);

      //Act
      const result = await categoryService.findOne(1);

      //Assert
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category not found', async () => {
      // Arrange
      categoryRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(categoryService.findOne(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should update category without file', async () => {
      // Arrange
      const updateCategoryDto = {
        name: 'Updated Category',
      };
      jest.spyOn(categoryService, 'findOne').mockResolvedValue(mockCategory);
      categoryRepository.save.mockResolvedValue({
        ...mockCategory,
        name: updateCategoryDto.name,
      });

      // Act
      const result = await categoryService.update(1, updateCategoryDto, null);

      // Assert
      expect(streamToBase64Image).not.toHaveBeenCalled();
      expect(imageService.upload).not.toHaveBeenCalled();
      expect(imageService.update).not.toHaveBeenCalled();
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(categoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateCategoryDto.name,
        }),
      );
      expect(result.name).toBe(updateCategoryDto.name);
    });

    it('should update category image when file exists and image already present', async () => {
      // Arrange
      const updateCategoryDto = {};
      const updatedImage = {
        id: 1,
        url: 'new-url',
        publicId: 'public-id',
        version: 2,
      };

      jest.spyOn(categoryService, 'findOne').mockResolvedValue(mockCategory);
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      imageService.update.mockResolvedValue(updatedImage);
      categoryRepository.save.mockResolvedValue({
        ...mockCategory,
        image: updatedImage,
      });

      // Act
      const result = await categoryService.update(
        1,
        updateCategoryDto,
        mockFile,
      );

      // Assert
      expect(streamToBase64Image).toHaveBeenCalledWith(
        mockFile.createReadStream(),
        mockFile.mimetype,
      );
      expect(imageService.update).toHaveBeenCalledWith(
        mockBase64,
        mockImage.publicId,
      );
      expect(imageService.upload).not.toHaveBeenCalled();
      expect(categoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          image: updatedImage,
        }),
      );
      expect(result.image).toEqual(updatedImage);
    });

    it('should upload new image when category has no existing image', async () => {
      // Arrange
      const updateCategoryDto = {};
      const updatedImage = {
        id: 1,
        url: 'new-url',
        publicId: 'public-id',
        version: 2,
      };
      jest
        .spyOn(categoryService, 'findOne')
        .mockResolvedValue(mockCategoryWithoutImage);
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      imageService.update.mockResolvedValue(updatedImage);
      categoryRepository.save.mockResolvedValue({
        ...mockCategoryWithoutImage,
        image: updatedImage,
      });

      // Act
      const result = await categoryService.update(
        1,
        updateCategoryDto,
        mockFile,
      );

      // Assert
      expect(imageService.upload).toHaveBeenCalledWith(mockBase64);
      expect(imageService.update).not.toHaveBeenCalled();

      expect(result.image).toEqual(updatedImage);
    });
  });

  describe('remove()', () => {
    it('should remove category with image', async () => {
      // Arrange
      queryRunner.manager.findOne.mockResolvedValue(mockCategory);
      cloudinaryService.deleteImage.mockResolvedValue(undefined);
      // queryRunner.manager.remove.mockResolvedValue(undefined)

      // Act
      const result = await categoryService.remove(1);

      // Assert
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.findOne).toHaveBeenCalled();
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        mockImage.publicId,
      );
      expect(queryRunner.manager.remove).toHaveBeenCalledWith(Image, mockImage);
      expect(queryRunner.manager.remove).toHaveBeenCalledWith(mockCategory);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        message: 'Category deleted successfully',
      });
    });

    it('should remove category without image', async () => {
      // Arrange
      queryRunner.manager.findOne.mockResolvedValue(mockCategoryWithoutImage);

      // Act
      const result = await categoryService.remove(1);

      // Assert
      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(queryRunner.manager.remove).toHaveBeenCalledWith(
        mockCategoryWithoutImage,
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if category not found', async () => {
      // Arrange
      queryRunner.manager.findOne.mockResolvedValue(null);

      // Assert
      await expect(categoryService.remove(1)).rejects.toThrow(
        NotFoundException,
      );

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.remove).not.toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
