import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from 'src/modules/image/entities/image.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Image, Product, Order, OrderItem]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
