import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/modules/category/entities/category.entity';
import { Image } from 'src/modules/image/entities/image.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Repository } from 'typeorm';
import categories from '../../data/categories.json';
import products from '../../data/products.json';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async seedData() {
    // Removing all data
    await this.orderRepository.query(
      `TRUNCATE TABLE "order" RESTART IDENTITY CASCADE`,
    );
    await this.orderItemRepository.query(
      `TRUNCATE TABLE order_item RESTART IDENTITY CASCADE`,
    );
    await this.productRepository.query(
      `TRUNCATE TABLE product RESTART IDENTITY CASCADE`,
    );
    await this.imageRepository.query(
      `TRUNCATE TABLE image RESTART IDENTITY CASCADE`,
    );
    await this.categoryRepository.query(
      `TRUNCATE TABLE category RESTART IDENTITY CASCADE`,
    );

    // Seed Category
    this.categoryRepository.deleteAll();

    const updatedCategories = categories.map((category) => {
      const newCategory = new Category();
      newCategory.name = category.category;
      newCategory.image = new Image(
        category.image.url,
        category.image.publicId,
        1,
      );

      return newCategory;
    });

    const savedCategories =
      await this.categoryRepository.save(updatedCategories);

    // Seed Product
    const updatedProducts = products.map((product) => {
      const matchingCategory = categories.find(
        (category) => product.category._id === category._id,
      );
      const matchingCategoryFromEntity = savedCategories.find(
        (savedCategory) => savedCategory.name === matchingCategory?.category,
      );

      const newProduct = new Product();
      newProduct.name = product.name;
      newProduct.price = product.price;
      newProduct.category = matchingCategoryFromEntity || new Category();
      newProduct.image = new Image(
        product.image.url,
        product.image.publicId,
        1,
      );

      return newProduct;
    });

    await this.productRepository.save(updatedProducts);
  }
}
