import { Module } from '@nestjs/common';
import Stripe from 'stripe';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { CartController } from './cart.controller';
import { ConfigService } from '@nestjs/config';
import { STRIPE_CLIENT } from 'src/core/constants/index';

@Module({
  providers: [
    CartService,
    CartResolver,
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Stripe(config.getOrThrow('stripe.secretKey'), {
          apiVersion: '2026-05-27.dahlia',
        });
      },
    },
  ],
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    UserModule,
    ProductModule,
  ],
  exports: [CartService],
  controllers: [CartController],
})
export class CartModule {}
