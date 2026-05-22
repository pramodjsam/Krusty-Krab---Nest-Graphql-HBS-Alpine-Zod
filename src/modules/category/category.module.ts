import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ImageModule } from '../image/image.module';

@Module({
  providers: [CategoryService, CategoryResolver],
  imports: [TypeOrmModule.forFeature([Category]), ImageModule],
  exports: [CategoryService],
})
export class CategoryModule {}
