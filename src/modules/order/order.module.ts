import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [OrderResolver, OrderService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    UserModule,
  ],
})
export class OrderModule {}
