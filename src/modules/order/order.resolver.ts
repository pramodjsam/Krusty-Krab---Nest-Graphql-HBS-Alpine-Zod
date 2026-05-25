import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { OrderService } from './order.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { UpdateOrderDto } from './dto/update-order.dto';

@Resolver(() => Order)
@UseGuards(AuthGuard)
@TransformDTO(Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => Order)
  createOrder(@CurrentUser() user: UserPayload) {
    return this.orderService.create(user);
  }

  @Query(() => [Order])
  getAllOrders() {
    return this.orderService.findAll();
  }

  @Query(() => Order)
  getOrder(@Args('id', { type: () => Int }) id: number) {
    return this.orderService.findOne(id);
  }

  @Mutation(() => Order)
  updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateOrder', { type: () => UpdateOrderDto })
    updateOrder: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, updateOrder);
  }
}
