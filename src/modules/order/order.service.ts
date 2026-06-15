import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { UserService } from '../user/user.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { OrderItem } from './entities/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly userService: UserService,
  ) {}

  async create(currentUser: UserPayload, createOrder: CreateOrderDto) {
    try {
      const { address, city, province, zipCode } = createOrder;
      const user = await this.userService.findByEmail(currentUser.email);

      if (user.cart) {
        const cart = await this.cartService.findOne(user.cart.id);

        if (!cart.cartItem || cart.cartItem.length === 0) {
          throw new NotFoundException('No items in the cart.');
        }

        const orderItems = cart.cartItem.map((cartItem) => {
          const orderItem = new OrderItem();
          orderItem.product = cartItem.product;
          orderItem.quantity = cartItem.quantity;
          orderItem.price = cartItem.product.price;

          return orderItem;
        });

        const itemsPrice = orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const taxPrice = Number((itemsPrice * 0.13).toFixed(2));
        const shippingPrice = itemsPrice > 100 ? 0 : 0;
        const totalPrice = Number(
          (itemsPrice + taxPrice + shippingPrice).toFixed(2),
        );

        const order = this.orderRepository.create({
          user,
          orderItem: orderItems,
          taxPrice,
          shippingPrice,
          totalPrice,
          address,
          city,
          province,
          zipCode,
        });
        const savedOrder = await this.orderRepository.save(order);

        await this.cartService.remove(user.cart.id);

        return this.findOne(savedOrder.id);
      } else {
        throw new NotFoundException('Cart not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Something went wrong');
    }
  }

  async findAll(query: PaginateQuery) {
    return await paginate(query, this.orderRepository, {
      sortableColumns: ['id', 'user', 'totalPrice'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['user'],
      filterableColumns: {
        user: [FilterOperator.EQ, FilterSuffix.NOT],
        totalPrice: [
          FilterOperator.GTE,
          FilterOperator.LTE,
          FilterOperator.EQ,
          FilterOperator.BTW,
        ],
      },
      defaultLimit: 5,
      relations: ['user', 'orderItem', 'orderItem.product'],
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
        orderItem: {
          product: {
            category: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findUserOrders(userId: number, query: PaginateQuery) {
    return await paginate(query, this.orderRepository, {
      where: {
        user: {
          id: userId,
        },
      },
      sortableColumns: ['id'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['id'],
      filterableColumns: {
        id: [FilterOperator.EQ, FilterSuffix.NOT],
      },
      defaultLimit: 5,
      relations: ['user', 'orderItem', 'orderItem.product'],
    });
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    Object.assign(order, updateOrderDto);

    return await this.orderRepository.save(order);
  }

  async deleteIfUnpaid(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) return;

    if (order.isPaid) return;

    await this.orderRepository.remove(order);
  }
}
