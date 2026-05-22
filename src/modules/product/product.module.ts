import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category/category.module';

@Module({
  providers: [ProductService, ProductResolver],
  imports: [TypeOrmModule.forFeature([Product]), CategoryModule],
})
export class ProductModule {}
