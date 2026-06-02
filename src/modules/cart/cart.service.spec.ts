import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CartService } from './cart.service';
import { Repository } from 'typeorm';
import { Cart } from './entity/cart.entity';
import { CartItem } from './entity/cart-item.entity';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Role } from 'src/core/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartService', () => {
  let cartService: CartService;
  let cartRepository: DeepMocked<Repository<Cart>>;
  let cartItemRepository: DeepMocked<Repository<CartItem>>;
  let userService: DeepMocked<UserService>;
  let productService: DeepMocked<ProductService>;

  let mockCart: Cart;
  let mockCartItem: CartItem;
  let mockCategory: Category;
  let mockProduct: Product;
  let mockUser: User;
  let mockUserWithCart: User;
  let mockUserPayload: UserPayload;

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
    };
    mockCart = {
      id: 1,
      user: mockUser,
      cartItem: [mockCartItem],
    };
    mockCartItem.cart = mockCart;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: createMock<Repository<Cart>>(),
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: createMock<Repository<CartItem>>(),
        },
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: ProductService,
          useValue: createMock<ProductService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile();

    cartService = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(Cart));
    cartItemRepository = module.get(getRepositoryToken(CartItem));
    userService = module.get(UserService);
    productService = module.get(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new cart if user has no cart', async () => {
      // Arrange
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 1,
      };
      productService.findOne.mockResolvedValue(mockProduct);
      userService.findOne.mockResolvedValue(mockUser);
      cartRepository.save.mockResolvedValue(mockCart);

      // Act
      const result = await cartService.create(createCartDto, mockUserPayload);

      // Assert
      expect(result).toEqual(mockCart);
    });

    it('should add item to existing cart', async () => {
      // Arrange
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 1,
      };
      productService.findOne.mockResolvedValue(mockProduct);
      userService.findOne.mockResolvedValue(mockUserWithCart);
      cartRepository.save.mockResolvedValue(mockCart);

      // Act
      const result = await cartService.create(createCartDto, mockUserPayload);

      // Assert
      expect(result).toEqual(mockCart);
    });

    it('should increase quantity if product already exist in cart', async () => {
      // Arrange
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 2,
      };
      productService.findOne.mockResolvedValue(mockProduct);
      userService.findOne.mockResolvedValue(mockUserWithCart);
      cartRepository.save.mockResolvedValue(mockCart);
      jest.spyOn(cartService, 'findOne').mockResolvedValue(mockCart);

      // Act
      const result = await cartService.create(createCartDto, mockUserPayload);

      // Assert
      expect(mockCart.cartItem?.[0].quantity).toBe(3);
      expect(result).toEqual(mockCart);
    });
  });

  describe('findAll()', () => {
    it('should return all carts', async () => {
      // Arrange
      cartRepository.find.mockResolvedValue([mockCart]);

      // Act
      const result = await cartService.findAll();

      // Assert
      expect(result).toEqual([mockCart]);
    });
  });

  describe('findOne()', () => {
    it('should return a cart by id', async () => {
      // Arrange
      cartRepository.findOne.mockResolvedValue(mockCart);

      // Act
      const result = await cartService.findOne(1);

      // Assert
      expect(result).toEqual(mockCart);
    });

    it('should throw error if cart not found', async () => {
      // Arrange
      cartRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(cartService.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCartItem()', () => {
    it('should return a cart item by id', async () => {
      // Arrange
      cartItemRepository.findOne.mockResolvedValue(mockCartItem);

      // Act
      const result = await cartService.findCartItem(1);

      // Assert
      expect(result).toEqual(mockCartItem);
    });

    it('should throw error if cart item is not found', async () => {
      // Arrange
      cartItemRepository.findOne.mockResolvedValue(null);

      // Assert
      await expect(cartService.findCartItem(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    describe('updateCartItemQuantity()', () => {
      it('should update cart item quantity', async () => {
        // Arrange
        const updateCartItemDto: UpdateCartItemDto = {
          quantity: 1,
        };
        jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);
        cartItemRepository.save.mockResolvedValue({
          ...mockCartItem,
          quantity: 2,
        });

        // Act
        const result = await cartService.updateCartItemQuantity(
          1,
          updateCartItemDto,
        );

        // Assert
        expect(result.quantity).toBe(2);
        expect(result).toEqual({
          ...mockCartItem,
          quantity: 2,
        });
      });

      it('should update cart item upto max of 10 item', async () => {
        // Arrange
        const updateCartItemDto: UpdateCartItemDto = {
          quantity: 20,
        };
        jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);
        cartItemRepository.save.mockResolvedValue({
          ...mockCartItem,
          quantity: 10,
        });

        // Act
        const result = await cartService.updateCartItemQuantity(
          1,
          updateCartItemDto,
        );

        // Assert
        expect(result.quantity).toBe(10);
        expect(mockCartItem.quantity).toBe(10);
        expect(result).toEqual({
          ...mockCartItem,
          quantity: 10,
        });
      });
    });

    describe('incrementCartItemQuantity()', () => {
      it('should increment cart item quantity by 1', async () => {
        // Arrange
        jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);
        cartItemRepository.save.mockResolvedValue({
          ...mockCartItem,
          quantity: 2,
        });

        // Act
        const result = await cartService.incrementCartItemQuantity(1);

        // Assert
        expect(mockCartItem.quantity).toBe(2);
        expect(result).toEqual({
          ...mockCartItem,
          quantity: 2,
        });
      });

      it('should increment cart item quantity upto max of 10', async () => {
        // Arrange
        mockCartItem.quantity = 10;
        jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);
        cartItemRepository.save.mockResolvedValue({
          ...mockCartItem,
          quantity: 10,
        });

        // Act
        const result = await cartService.incrementCartItemQuantity(1);

        // Assert
        expect(mockCartItem.quantity).toBe(10);
        expect(result).toEqual({
          ...mockCartItem,
          quantity: 10,
        });
      });
    });

    describe('decrementCartItemQuantity()', () => {
      it('should decrement cart item quantity by 1', async () => {
        // Arrange
        mockCartItem.quantity = 6;
        jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);
        cartItemRepository.save.mockResolvedValue({
          ...mockCartItem,
          quantity: 5,
        });

        // Act
        const result = await cartService.decrementCartItemQuantity(1);

        // Assert
        expect(mockCartItem.quantity).toBe(5);
        expect(result).toEqual({
          ...mockCartItem,
          quantity: 5,
        });
      });

      it('should not decrement cart item quantity below 1', async () => {
        // Arrange
        jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);
        cartItemRepository.save.mockResolvedValue({
          ...mockCartItem,
          quantity: 1,
        });

        // Act
        const result = await cartService.decrementCartItemQuantity(1);

        // Assert
        expect(mockCartItem.quantity).toBe(1);
        expect(result).toEqual({
          ...mockCartItem,
          quantity: 1,
        });
      });
    });
  });

  describe('remove()', () => {
    it('should remove cart', async () => {
      // Arrange
      jest.spyOn(cartService, 'findOne').mockResolvedValue(mockCart);

      // Act
      const result = await cartService.remove(1);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Cart deleted successfully',
      });
    });
  });

  describe('removeCartItem()', () => {
    it('should remove cart item', async () => {
      // Arrange
      jest.spyOn(cartService, 'findCartItem').mockResolvedValue(mockCartItem);

      // Act
      const result = await cartService.removeCartItem(1);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Cart Item removed successfully',
      });
    });
  });
});
