import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { OrderService } from './order.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationArgs } from 'src/core/dto/pagination.args';
import { Paginated } from 'src/core/dto/entity-paginate.dto';
import { toPaginateQuery } from 'src/utils/pagination';

const OrderPaginated = Paginated(Order);

@Resolver(() => Order)
@UseGuards(AuthGuard)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => Order)
  @TransformDTO(Order)
  createOrder(@CurrentUser() user: UserPayload) {
    return this.orderService.create(user);
  }

  @Query(() => OrderPaginated)
  @TransformDTO(Order)
  getAllOrders(@Args() args: PaginationArgs) {
    const query = toPaginateQuery(args);

    return this.orderService.findAll(query);
  }

  @Query(() => Order)
  @TransformDTO(Order)
  getOrder(@Args('id', { type: () => Int }) id: number) {
    return this.orderService.findOne(id);
  }

  @Mutation(() => Order)
  @TransformDTO(Order)
  updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateOrder', { type: () => UpdateOrderDto })
    updateOrder: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, updateOrder);
  }
}
