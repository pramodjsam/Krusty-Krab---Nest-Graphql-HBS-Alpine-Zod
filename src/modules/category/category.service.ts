import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileUpload } from 'graphql-upload';
import { ImageService } from '../image/image.service';
import { streamToBase64Image } from 'src/utils/file.util';
import { Image } from '../image/entities/image.entity';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { RedisCacheService } from 'src/core/redis-cache/redis-cache.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly imageService: ImageService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, file?: FileUpload | null) {
    const category = new Category();
    Object.assign(category, createCategoryDto);

    if (file) {
      const { url, publicId, version } = await this.imageService.upload(
        await streamToBase64Image(file.createReadStream(), file.mimetype),
      );
      const image = new Image(url, publicId, version);
      category.image = image;
    }

    await this.invalidateCategory();

    return await this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      relations: {
        image: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    file?: FileUpload | null,
  ) {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);

    if (file) {
      if (category.image) {
        const updatedImage = await this.imageService.update(
          await streamToBase64Image(file.createReadStream(), file.mimetype),
          category.image.publicId,
        );
        category.image = updatedImage;
      } else {
        const newCategoryImage = await this.imageService.upload(
          await streamToBase64Image(file.createReadStream(), file.mimetype),
        );
        category.image = newCategoryImage;
      }
    }

    await this.invalidateCategory(category.id);

    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const category = await queryRunner.manager.findOne(Category, {
        where: {
          id,
        },
        relations: {
          image: true,
        },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const image = category.image;

      if (image) {
        await this.cloudinaryService.deleteImage(image.publicId);
        await queryRunner.manager.remove(Image, image);
      }

      await this.invalidateCategory(id);

      await queryRunner.manager.remove(category);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error('Something went wrong');
    } finally {
      await queryRunner.release();
    }
  }

  private async invalidateCategory(id?: number) {
    if (id !== undefined) {
      this.redisCacheService.invalidateTag('category:detail', { id });
    }

    this.redisCacheService.invalidateTag('category:list');
  }
}
