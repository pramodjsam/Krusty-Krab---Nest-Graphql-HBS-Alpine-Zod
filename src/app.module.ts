import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ImageModule } from './modules/image/image.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [CoreModule, CategoryModule, ProductModule, ImageModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
