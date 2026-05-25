import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { CartService } from './cart.service';
import { Cart } from './entity/cart.entity';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { ResponseCartDto } from './dto/response-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { ResponseCartItemDto } from './dto/response-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { DeleteResponseDto } from 'src/core/dto/delete.response.dto';

@Resolver(() => Cart)
@UseGuards(AuthGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Mutation(() => ResponseCartDto)
  @TransformDTO(ResponseCartDto)
  createCart(
    @Args('createCart', { type: () => CreateCartDto })
    createCart: CreateCartDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.cartService.create(createCart, user);
  }

  @Query(() => [ResponseCartDto])
  @TransformDTO(ResponseCartDto)
  getAllCarts() {
    return this.cartService.findAll();
  }

  @Query(() => ResponseCartDto)
  @TransformDTO(ResponseCartDto)
  getCart(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.findOne(id);
  }

  @Query(() => ResponseCartItemDto)
  @TransformDTO(ResponseCartItemDto)
  getCartItem(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.findCartItem(id);
  }

  @Mutation(() => ResponseCartItemDto)
  @TransformDTO(ResponseCartItemDto)
  incrementCartItemQuantity(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.incrementCartItemQuantity(id);
  }

  @Mutation(() => ResponseCartItemDto)
  @TransformDTO(ResponseCartItemDto)
  decrementCartItemQuantity(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.decrementCartItemQuantity(id);
  }

  @Mutation(() => ResponseCartItemDto)
  @TransformDTO(ResponseCartItemDto)
  updateCartItem(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateCart', { type: () => UpdateCartItemDto })
    updateCart: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItemQuantity(id, updateCart);
  }

  @Mutation(() => DeleteResponseDto)
  @TransformDTO(DeleteResponseDto)
  deleteCart(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.remove(id);
  }

  @Mutation(() => DeleteResponseDto)
  @TransformDTO(DeleteResponseDto)
  deleteCartItem(@Args('id', { type: () => Int }) id: number) {
    return this.cartService.removeCartItem(id);
  }
}
