import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';
import { ImageModule } from '../image/image.module';

@Module({
  providers: [ProductService, ProductResolver],
  imports: [TypeOrmModule.forFeature([Product]), CategoryModule, ImageModule],
  exports: [ProductService],
  controllers: [],
})
export class ProductModule {}
