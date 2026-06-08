import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoryService } from '../category/category.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileUpload } from 'graphql-upload';
import { streamToBase64Image } from 'src/utils/file.util';
import { ImageService } from '../image/image.service';
import { Image } from '../image/entities/image.entity';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { RedisCacheService } from 'src/core/redis-cache/redis-cache.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(query: PaginateQuery) {
    return await paginate(query, this.productRepository, {
      sortableColumns: ['id', 'name', 'price'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        price: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE],
      },
      defaultLimit: 5,
      relations: ['image', 'category'],
      maxLimit: 300,
    });
  }

  async create(createProductDto: CreateProductDto, file?: FileUpload | null) {
    const category = await this.categoryService.findOne(
      createProductDto.categoryId,
    );

    const product = new Product();
    Object.assign(product, { ...createProductDto, category });

    if (file) {
      const { url, publicId, version } = await this.imageService.upload(
        await streamToBase64Image(file.createReadStream(), file.mimetype),
      );
      const image = new Image(url, publicId, version);
      product.image = image;
    }

    const savedProduct = await this.productRepository.save(product);

    await this.redisCacheService.invalidateCacheForService('product');

    return savedProduct;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
        image: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: FileUpload | null,
  ) {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    if (updateProductDto.categoryId) {
      product.category =
        product.category.id !== updateProductDto.categoryId
          ? await this.categoryService.findOne(updateProductDto.categoryId)
          : product.category;
    }

    if (file) {
      if (product.image) {
        const updatedImage = await this.imageService.update(
          await streamToBase64Image(file.createReadStream(), file.mimetype),
          product.image.publicId,
        );
        product.image = updatedImage;
      } else {
        const newProductImage = await this.imageService.upload(
          await streamToBase64Image(file.createReadStream(), file.mimetype),
        );
        product.image = newProductImage;
      }
    }

    await this.redisCacheService.invalidateCacheForService('product', id);

    return await this.productRepository.save(product);
  }

  async delete(id: number) {
    const product = await this.findOne(id);

    if (product.image) {
      await this.imageService.remove(product.image.id);
    }

    await this.productRepository.remove(product);

    await this.redisCacheService.invalidateCacheForService('product', id);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
