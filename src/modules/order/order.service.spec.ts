import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { OrderService } from './order.service';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CartService } from '../cart/cart.service';
import { UserService } from '../user/user.service';
import { Cart } from '../cart/entity/cart.entity';
import { CartItem } from '../cart/entity/cart-item.entity';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus, PaymentMethod, Role } from 'src/core/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepository: DeepMocked<Repository<Order>>;
  let cartService: DeepMocked<CartService>;
  let userService: DeepMocked<UserService>;

  let mockCart: Cart;
  let mockCartItem: CartItem;
  let mockCategory: Category;
  let mockProduct: Product;
  let mockUser: User;
  let mockUserWithCart: User;
  let mockUserPayload: UserPayload;
  let mockOrder: Order;
  let mockOrderItem: OrderItem;

  beforeEach(async () => {
    mockUser = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      password: 'hashed',
      role: Role.EMPLOYEE,
      cart: null,
      passwordChangedAt: new Date(),
    };
    mockUserPayload = {
      id: 1,
      email: 'john@test.com',
      role: Role.EMPLOYEE,
    };
    mockCategory = {
      id: 1,
      name: 'Electronics',
      image: undefined,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProduct = {
      id: 1,
      name: 'Laptop',
      price: 1200,
      category: mockCategory,
      image: undefined,
    };
    mockCartItem = {
      id: 1,
      product: mockProduct,
      quantity: 1,
      cart: mockCart,
    };
    mockCart = {
      id: 1,
      user: mockUser,
      cartItem: [mockCartItem],
    };
    mockUserWithCart = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      password: 'hashed',
      role: Role.EMPLOYEE,
      cart: mockCart,
      passwordChangedAt: new Date(),
    };
    mockCartItem.cart = mockCart;
    mockOrderItem = {
      id: 1,
      product: mockProduct,
      quantity: 2,
      price: 100,
      order: mockOrder,
    };
    mockOrder = {
      id: 1,
      user: mockUser,
      paymentMethod: PaymentMethod.CARD,
      orderItem: [mockOrderItem as OrderItem],
      taxPrice: 26,
      shippingPrice: 0,
      totalPrice: 226,
      isPaid: false,
      status: OrderStatus.PLACED,
      deliveredAt: null,
    };
    mockOrderItem.order = mockOrder;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: createMock<Repository<Order>>(),
        },
        {
          provide: CartService,
          useValue: createMock<CartService>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    orderService = module.get<OrderService>(OrderService);
    orderRepository = module.get(getRepositoryToken(Order));
    cartService = module.get(CartService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('create()', () => {
    it('should create new order', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUserWithCart);
      cartService.findOne.mockResolvedValue(mockCart);
      orderRepository.create.mockReturnValue(mockOrder);
      orderRepository.save.mockResolvedValue(mockOrder);
      jest.spyOn(orderService, 'findOne').mockResolvedValue(mockOrder);

      // Act
      const result = await orderService.create(mockUserPayload);

      // Assert
      expect(cartService.remove).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw error if user with cart is not found', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      cartService.findOne.mockResolvedValue(mockCart);

      // Assert
      await expect(orderService.create(mockUserPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll()', () => {
    it('should return all orders', async () => {
      // Arrange
      orderRepository.find.mockResolvedValue([mockOrder]);

      // Act
      const result = await orderService.findAll();

      // Assert
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findOne()', () => {
    it('should return order when id is passed', async () => {
      // Arrange
      orderRepository.findOne.mockResolvedValue(mockOrder);

      // Act
      const result = await orderService.findOne(1);

      // Assert
      expect(result).toEqual(mockOrder);
    });

    it('should throw error when order is not found', async () => {
      // Arrange
      orderRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(orderService.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should update order successfully', async () => {
      // Arrange
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.CONFIRMED,
      };
      jest.spyOn(orderService, 'findOne').mockResolvedValue(mockOrder);
      orderRepository.save.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });

      // Act
      const result = await orderService.updateOrder(1, updateOrderDto);

      // Assert
      expect(result).toEqual({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });
    });
  });
});
