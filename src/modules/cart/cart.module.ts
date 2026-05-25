import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';

@Module({
  providers: [CartService, CartResolver],
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    UserModule,
    ProductModule,
  ],
  exports: [CartService],
})
export class CartModule {}
