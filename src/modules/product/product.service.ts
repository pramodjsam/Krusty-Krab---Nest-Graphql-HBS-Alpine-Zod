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

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService,
  ) {}

  findAll() {
    return this.productRepository.find({
      relations: {
        category: true,
        image: true,
      },
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

    return await this.productRepository.save(product);
  }

  async delete(id: number) {
    const product = await this.findOne(id);

    if (product.image) {
      await this.imageService.remove(product.image.id);
    }

    await this.productRepository.remove(product);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
