import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ImageModule } from './modules/image/image.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { HomeModule } from './modules/home/home.module';

@Module({
  imports: [
    CoreModule,
    CategoryModule,
    ProductModule,
    ImageModule,
    UserModule,
    AuthModule,
    CartModule,
    OrderModule,
    HomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
