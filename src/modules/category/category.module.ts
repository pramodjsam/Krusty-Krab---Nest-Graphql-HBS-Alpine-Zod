import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ImageModule } from '../image/image.module';
import { CategoryController } from './category.controller';

@Module({
  providers: [CategoryService, CategoryResolver],
  imports: [TypeOrmModule.forFeature([Category]), ImageModule],
  exports: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
