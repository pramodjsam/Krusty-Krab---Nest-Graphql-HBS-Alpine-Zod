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
        cartItem.quantity = quantity;
        cartItem.product = product;

        cart.cartItem.push(cartItem);

        return await this.cartRepository.save(cart);
      } else {
        if (!user.cart?.id) throw new Error('Cart id not found');

        const cart = await this.findOne(user.cart?.id);
        let cartItem = cart.cartItem?.find(
          (item) => item.product.id === productId,
        );

        if (cartItem) {
          cartItem.quantity += quantity;
        } else {
          cartItem = new CartItem();
          cartItem.product = product;
          cartItem.quantity = quantity;
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
}
