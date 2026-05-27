import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Readable } from 'stream';
import { NotFoundException } from '@nestjs/common';

describe('ImageService', () => {
  let imageService: ImageService;
  let imageRepository: DeepMocked<Repository<Image>>;
  let cloudinaryService: DeepMocked<CloudinaryService>;

  let mockImage: Image;
  let mockBase64: string;
  let cloudinaryResponse;

  beforeEach(async () => {
    mockImage = {
      id: 1,
      url: 'http://image.com/img.png',
      publicId: 'public-id',
      version: 1,
    };
    mockBase64 = 'base64-image';
    cloudinaryResponse = {
      secure_url: 'http://new-image.com/img.png',
      public_id: 'public-id',
      version: 2,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(Image),
          useValue: createMock<Repository<Image>>(),
        },
        {
          provide: CloudinaryService,
          useValue: createMock<CloudinaryService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    imageService = module.get<ImageService>(ImageService);
    imageRepository = module.get(getRepositoryToken(Image));
    cloudinaryService = module.get(CloudinaryService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(imageService).toBeDefined();
  });

  describe('upload', () => {
    it('should upload new image', async () => {
      // Arrange
      imageRepository.save.mockResolvedValue(mockImage);
      cloudinaryService.uploadImage.mockResolvedValue(cloudinaryResponse);

      // Act
      const result = await imageService.upload(mockBase64);

      // Assert
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockBase64);
      expect(imageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          url: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id,
          version: cloudinaryResponse.version,
        }),
      );
      expect(result).toEqual(mockImage);
    });

    it('should upload new image with stream', async () => {
      // Arrange
      const mockStream = new Readable();
      const cloudinaryResponse = {
        secure_url: 'http://image.com/img.png',
        public_id: 'public-id',
        version: 1,
      };
      imageRepository.save.mockResolvedValue(mockImage);
      cloudinaryService.uploadStream.mockResolvedValue(cloudinaryResponse);

      // Act
      const result = await imageService.uploadStream(mockStream);

      // Assert
      expect(cloudinaryService.uploadStream).toHaveBeenCalledWith(mockStream);
      expect(imageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          publicId: cloudinaryResponse.public_id,
          version: cloudinaryResponse.version,
          url: cloudinaryResponse.secure_url,
        }),
      );
      expect(result).toEqual(mockImage);
    });
  });

  describe('findOne()', () => {
    it('should return image by id', async () => {
      // Arrange
      imageRepository.findOne.mockResolvedValue(mockImage);

      // Act
      const result = await imageService.findOne(1);

      // Assert
      expect(imageRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockImage);
    });

    it('should throw error if image is not found', async () => {
      // Arrange
      imageRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(imageService.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update image by publicId', async () => {
      // Arrange
      imageRepository.findOne.mockResolvedValue(mockImage);
      cloudinaryService.updateImage.mockResolvedValue(cloudinaryResponse);
      imageRepository.save.mockResolvedValue({
        ...mockImage,
        url: cloudinaryResponse.secure_url,
        version: cloudinaryResponse.version,
      });

      // Act
      const result = await imageService.update(mockBase64, mockImage.publicId);

      // Assert
      expect(imageRepository.findOne).toHaveBeenCalled();
      expect(imageRepository.findOne).toHaveBeenCalledWith({
        where: {
          publicId: mockImage.publicId,
        },
      });
      expect(cloudinaryService.updateImage).toHaveBeenCalled();
      expect(cloudinaryService.updateImage).toHaveBeenCalledWith(
        mockBase64,
        mockImage.publicId,
      );
      expect(imageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockImage.id,
          publicId: mockImage.publicId,
          url: cloudinaryResponse.secure_url,
          version: cloudinaryResponse.version,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          url: cloudinaryResponse.secure_url,
          version: cloudinaryResponse.version,
        }),
      );
    });

    it('should throw error if image with publicId not found', async () => {
      // Arrange
      imageRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(
        imageService.update(mockBase64, mockImage.publicId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should remove image by id', async () => {
      // Arrange
      jest.spyOn(imageService, 'findOne').mockResolvedValue(mockImage);

      // Act
      const result = await imageService.remove(1);

      // Assert
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        mockImage.publicId,
      );
      expect(imageRepository.remove).toHaveBeenCalledWith(mockImage);
      expect(result).toEqual({
        success: true,
        message: 'Image deleted successfully',
      });
    });
  });
});
