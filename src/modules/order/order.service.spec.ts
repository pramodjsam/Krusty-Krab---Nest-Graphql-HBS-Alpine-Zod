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
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateOrderDto } from './dto/create-order.dto';

jest.mock('nestjs-paginate', () => ({
  ...jest.requireActual('nestjs-paginate'),
  paginate: jest.fn(),
}));

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
  let mockPaginatedOrderResponse: Paginated<Order>;

  beforeEach(async () => {
    mockUser = {
      id: 1,
      name: 'John',
      email: 'john@test.com',
      password: 'hashed',
      role: Role.EMPLOYEE,
      cart: null,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
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
      cartId: 1,
      productId: 1,
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
      createdAt: new Date(),
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
      createdAt: new Date(),
      address: '',
      city: '',
      province: '',
      zipCode: '',
    };
    mockPaginatedOrderResponse = {
      data: [mockOrder],
      meta: {
        itemsPerPage: 5,
        totalItems: 1,
        currentPage: 1,
        totalPages: 1,
        sortBy: [['id', 'DESC']], // matches your paginate config
        searchBy: ['user'], // whichever columns are searchable
        search: '', // empty string if no search applied
        select: ['id', 'user'], // columns selected, optional but required in TS
      },
      links: {
        first: undefined,
        previous: undefined,
        next: undefined,
        last: undefined,
        current: '',
      },
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
      const mockCreateOrderDto: CreateOrderDto = {
        address: '',
        city: '',
        province: '',
        zipCode: '',
      };
      userService.findByEmail.mockResolvedValue(mockUserWithCart);
      cartService.findOne.mockResolvedValue(mockCart);
      orderRepository.create.mockReturnValue(mockOrder);
      orderRepository.save.mockResolvedValue(mockOrder);
      jest.spyOn(orderService, 'findOne').mockResolvedValue(mockOrder);

      // Act
      const result = await orderService.create(
        mockUserPayload,
        mockCreateOrderDto,
      );

      // Assert
      expect(cartService.remove).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw error if user with cart is not found', async () => {
      // Arrange
      const mockCreateOrderDto: CreateOrderDto = {
        address: '',
        city: '',
        province: '',
        zipCode: '',
      };
      userService.findByEmail.mockResolvedValue(mockUser);
      cartService.findOne.mockResolvedValue(mockCart);

      // Assert
      await expect(
        orderService.create(mockUserPayload, mockCreateOrderDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll()', () => {
    it('should return all orders', async () => {
      // Arrange
      const mockPaginatedQuery: PaginateQuery = {
        page: 1,
        path: '',
      };
      (paginate as jest.Mock).mockResolvedValue(mockPaginatedOrderResponse);

      // Act
      const result = await orderService.findAll(mockPaginatedQuery);

      // Assert
      expect(result).toEqual(mockPaginatedOrderResponse);
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

  describe('findUserOrder', () => {
    it('should find user order', async () => {
      // Arrange
      const mockPaginatedQuery: PaginateQuery = {
        page: 1,
        path: '',
      };
      (paginate as jest.Mock).mockResolvedValue(mockPaginatedOrderResponse);

      // Act
      const result = await orderService.findUserOrders(
        mockUser.id,
        mockPaginatedQuery,
      );

      // Assert
      expect(result).toEqual(mockPaginatedOrderResponse);
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
