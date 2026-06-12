import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entity/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart-item.entity';
import { UserService } from '../user/user.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { ProductService } from '../product/product.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { SyncCartItemInput } from './dto/sync-cart.input';
import { UpdateUserCartDto } from './dto/update-user-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  async create(createCartDto: CreateCartDto, currentUser: UserPayload) {
    try {
      const { productId, quantity } = createCartDto;
      const product = await this.productService.findOne(productId);
      const user = await this.userService.findByEmail(currentUser.email);

      if (!user.cart) {
        const cart = new Cart();
        cart.user = user;
        cart.cartItem = [];

        const cartItem = new CartItem();
        cartItem.quantity = Math.min(quantity, 10);
        cartItem.product = product;

        cart.cartItem.push(cartItem);

        return await this.cartRepository.save(cart);
      } else {
        const cart = await this.findOne(user.cart?.id);
        let cartItem = cart.cartItem?.find(
          (item) => item.product.id === productId,
        );

        if (cartItem) {
          cartItem.quantity = Math.min(cartItem.quantity + quantity, 10);
        } else {
          cartItem = new CartItem();
          cartItem.product = product;
          cartItem.quantity = Math.min(quantity, 10);
          cart.cartItem?.push(cartItem);
        }

        return await this.cartRepository.save(cart);
      }
    } catch {
      throw new BadRequestException('Something went wrong while creating cart');
    }
  }

  async findAll() {
    return await this.cartRepository.find({
      relations: {
        user: true,
        cartItem: {
          product: true,
        },
      },
    });
  }

  async findOne(id: number) {
    const cart = await this.cartRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
        cartItem: {
          product: true,
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async findUserCart(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        cartItem: {
          product: true,
        },
        user: true,
      },
    });

    return cart;
  }

  async findCartItem(cartItemId: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
      },
      relations: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart Item not found');
    }

    return cartItem;
  }

  async updateCartItemQuantity(id: number, updateCartItem: UpdateCartItemDto) {
    const cartItem = await this.findCartItem(id);
    cartItem.quantity = Math.min(updateCartItem.quantity, 10);
    return await this.cartItemRepository.save(cartItem);
  }

  async incrementCartItemQuantity(cartItemId: number) {
    const cartItem = await this.findCartItem(cartItemId);
    cartItem.quantity = Math.min(cartItem.quantity + 1, 10);
    return await this.cartItemRepository.save(cartItem);
  }

  async decrementCartItemQuantity(cartItemId: number) {
    const cartItem = await this.findCartItem(cartItemId);
    cartItem.quantity = Math.max(cartItem.quantity - 1, 1);
    return await this.cartItemRepository.save(cartItem);
  }

  async remove(id: number) {
    const cart = await this.findOne(id);

    await this.cartRepository.remove(cart);

    return {
      success: true,
      message: 'Cart deleted successfully',
    };
  }

  async removeCartItem(cartItemId: number) {
    const cartItem = await this.findCartItem(cartItemId);

    await this.cartItemRepository.remove(cartItem);

    return {
      success: true,
      message: 'Cart Item removed successfully',
    };
  }

  async syncCart(userId: number, incomingItems: SyncCartItemInput[]) {
    let cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        cartItem: {
          product: true,
        },
      },
    });

    if (cart === null) {
      cart = await this.cartRepository.save(
        this.cartRepository.create({
          user: {
            id: userId,
          },
        }),
      );
    }

    const existingItems = cart.cartItem ?? [];
    const merged = new Map<number, number>();

    for (const item of existingItems) {
      merged.set(item.product.id, item.quantity);
    }

    for (const item of incomingItems) {
      merged.set(
        item.productId,
        Math.min(10, (merged.get(item.productId) ?? 0) + item.quantity),
      );
    }

    const entities = [...merged.entries()].map(([productId, quantity]) =>
      this.cartItemRepository.create({
        cartId: cart?.id,
        productId,
        quantity,
      }),
    );

    await this.cartItemRepository.delete({
      cartId: cart.id,
    });

    await this.cartItemRepository.save(entities);

    return await this.findUserCart(userId);
  }

  async updateUserCartItem(
    user: UserPayload,
    updateUserCart: UpdateUserCartDto,
  ) {
    const { productId, quantity } = updateUserCart;
    const userCart = await this.findUserCart(user.id);

    if (!userCart) {
      const createCartDto: CreateCartDto = {
        productId,
        quantity,
      };
      return this.create(createCartDto, user);
    }

    let cartItem = userCart.cartItem?.find(
      (item) => item.product.id === productId,
    );

    if (!cartItem) {
      const product = await this.productService.findOne(productId);

      cartItem = this.cartItemRepository.create({
        cart: userCart,
        product,
        quantity: Math.min(quantity, 10),
      });
    } else {
      cartItem.quantity = Math.min(quantity, 10);
    }

    await this.cartItemRepository.save(cartItem);

    return this.findUserCart(user.id);
  }

  async removeUserCartItem(user: UserPayload, productId: number) {
    const cart = await this.findUserCart(user.id);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = cart.cartItem?.find(
      (item) => item.productId === productId,
    );

    if (cartItem) {
      await this.removeCartItem(cartItem.id);

      return {
        success: true,
        message: 'Cart item removed successfully',
      };
    }

    return {
      success: false,
      message: 'No cart item found',
    };
  }

  async incrementCartItemByProduct(user: UserPayload, productId: number) {
    const cart = await this.findUserCart(user.id);

    if (!cart) {
      const createCart: CreateCartDto = {
        productId,
        quantity: 1,
      };
      return this.create(createCart, user);
    }

    let cartItem = cart.cartItem?.find((item) => item.productId === productId);

    if (!cartItem) {
      const updateCartItem: UpdateUserCartDto = {
        quantity: 1,
        productId,
      };
      return this.updateUserCartItem(user, updateCartItem);
    }

    return this.updateUserCartItem(user, {
      productId,
      quantity: cartItem.quantity + 1,
    });
  }

  async decrementCartItemByProduct(user: UserPayload, productId: number) {
    const cart = await this.findUserCart(user.id);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = cart.cartItem?.find(
      (item) => item.productId === productId,
    );

    if (!cartItem) return;

    if (cartItem.quantity <= 1) {
      await this.removeUserCartItem(user, productId);
      return this.findUserCart(user.id);
    }

    return this.updateUserCartItem(user, {
      productId,
      quantity: cartItem.quantity - 1,
    });
  }
}
