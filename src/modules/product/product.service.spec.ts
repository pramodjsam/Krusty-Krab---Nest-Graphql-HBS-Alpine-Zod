import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ProductService } from './product.service';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CategoryService } from '../category/category.service';
import { ImageService } from '../image/image.service';
import { Image } from '../image/entities/image.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { streamToBase64Image } from 'src/utils/file.util';
import { NotFoundException } from '@nestjs/common';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

jest.mock('src/utils/file.util', () => ({
  streamToBase64Image: jest.fn(),
}));

jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: DeepMocked<Repository<Product>>;
  let categoryService: DeepMocked<CategoryService>;
  let imageService: DeepMocked<ImageService>;

  let mockImage: Image;
  let mockCategory: Category;
  let mockProduct: Product;
  let mockProductWithoutImage: Product;
  let mockFile: any;
  let createProductDto: CreateProductDto;
  let mockBase64: string;
  let mockPaginatedProductResponse: Paginated<Product>;

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
    mockProduct = {
      id: 1,
      name: 'Laptop',
      price: 1200,
      category: mockCategory,
      image: mockImage,
    };
    mockPaginatedProductResponse = {
      data: [mockProduct],
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
    mockProductWithoutImage = {
      id: 1,
      name: 'Laptop',
      price: 1200,
      category: mockCategory,
      image: undefined,
    };
    mockFile = {
      createReadStream: jest.fn(),
      mimetype: 'image/png',
    } as any;
    createProductDto = {
      name: 'Product 1',
      price: 10,
      categoryId: 1,
    };
    mockBase64 = 'base64-image';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMock<Repository<Product>>(),
        },
        {
          provide: ImageService,
          useValue: createMock<ImageService>(),
        },
        {
          provide: CategoryService,
          useValue: createMock<CategoryService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get(getRepositoryToken(Product));
    imageService = module.get(ImageService);
    categoryService = module.get(CategoryService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('create()', () => {
    it('should create product and upload image', async () => {
      // Arrange
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      categoryService.findOne.mockResolvedValue(mockCategory);
      productRepository.save.mockResolvedValue(mockProduct);

      // Act
      const result = await productService.create(createProductDto, mockFile);

      // Assert
      expect(streamToBase64Image).toHaveBeenCalledWith(
        mockFile.createReadStream(),
        mockFile.mimetype,
      );
      expect(categoryService.findOne).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should not call image service if there is no file', async () => {
      // Arrange
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      categoryService.findOne.mockResolvedValue(mockCategory);
      productRepository.save.mockResolvedValue(mockProductWithoutImage);

      // Act
      const result = await productService.create(createProductDto);

      // Assert
      expect(categoryService.findOne).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalled();
      expect(streamToBase64Image).not.toHaveBeenCalled();
      expect(result).toEqual(mockProductWithoutImage);
    });
  });

  describe('findAll()', () => {
    it('should return all products', async () => {
      // Arrange
      const mockPaginatedQuery: PaginateQuery = {
        page: 1,
        path: '',
      };
      (paginate as jest.Mock).mockResolvedValue(mockPaginatedProductResponse);

      // Act
      const result = await productService.findAll(mockPaginatedQuery);

      // Assert
      expect(result).toEqual(mockPaginatedProductResponse);
    });
  });

  describe('findOne()', () => {
    it('should return category by id', async () => {
      // Arrange
      productRepository.findOne.mockResolvedValue(mockProduct);

      // Act
      const result = await productService.findOne(1);

      // Assert
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      // Arrange
      productRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(productService.findOne(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should update product without file', async () => {
      // Arrange
      const updateProductDto = {
        name: 'Updated Product',
      };
      jest.spyOn(productService, 'findOne').mockResolvedValue(mockProduct);
      productRepository.save.mockResolvedValue({
        ...mockProduct,
        name: updateProductDto.name,
      });

      //   Act
      const result = await productService.update(1, updateProductDto, null);

      //   Assert
      expect(streamToBase64Image).not.toHaveBeenCalled();
      expect(imageService.upload).not.toHaveBeenCalled();
      expect(imageService.update).not.toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateProductDto.name,
        }),
      );
      expect(result.name).toBe(updateProductDto.name);
    });

    it('should update product image when file exists and image already present', async () => {
      //   Arrange
      const updateProductDto = {};
      const updatedImage = {
        id: 1,
        url: 'new-url',
        publicId: 'public-id',
        version: 2,
      };
      jest.spyOn(productService, 'findOne').mockResolvedValue(mockProduct);
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      imageService.update.mockResolvedValue(updatedImage);
      productRepository.save.mockResolvedValue({
        ...mockProduct,
        image: updatedImage,
      });

      //   Act
      const result = await productService.update(1, updateProductDto, mockFile);

      //   Assert
      expect(streamToBase64Image).toHaveBeenCalledWith(
        mockFile.createReadStream(),
        mockFile.mimetype,
      );
      expect(imageService.update).toHaveBeenCalledWith(
        mockBase64,
        mockImage.publicId,
      );
      expect(imageService.upload).not.toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          image: updatedImage,
        }),
      );
      expect(result.image).toEqual(updatedImage);
    });

    it('should upload new image when product has no existing image', async () => {
      // Arrange
      const updateProductDto = {};
      const updatedImage = {
        id: 1,
        url: 'new-url',
        publicId: 'public-id',
        version: 2,
      };
      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValue(mockProductWithoutImage);
      (streamToBase64Image as jest.Mock).mockResolvedValue(mockBase64);
      imageService.update.mockResolvedValue(updatedImage);
      productRepository.save.mockResolvedValue({
        ...mockProductWithoutImage,
        image: updatedImage,
      });

      //   Act
      const result = await productService.update(1, updateProductDto, mockFile);

      // Assert
      expect(imageService.upload).toHaveBeenCalledWith(mockBase64);
      expect(imageService.update).not.toHaveBeenCalled();
      expect(result.image).toEqual(updatedImage);
    });
  });

  describe('remove()', () => {
    it('should remove product with image', async () => {
      // Arrange
      jest.spyOn(productService, 'findOne').mockResolvedValue(mockProduct);

      // Act
      const result = await productService.delete(1);

      // Assert
      expect(imageService.remove).toHaveBeenCalled();
      expect(productRepository.remove).toHaveBeenCalled();
      expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual({
        success: true,
        message: 'Product deleted successfully',
      });
    });

    it('should remove product without image', async () => {
      // Arrange
      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValue(mockProductWithoutImage);

      // Act
      const result = await productService.delete(1);

      // Assert
      expect(imageService.remove).not.toHaveBeenCalled();
      expect(productRepository.remove).toHaveBeenCalled();
      expect(productRepository.remove).toHaveBeenCalledWith(
        mockProductWithoutImage,
      );
      expect(result).toEqual({
        success: true,
        message: 'Product deleted successfully',
      });
    });
  });
});
