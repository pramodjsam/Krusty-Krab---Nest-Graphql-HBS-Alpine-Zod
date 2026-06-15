import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Redirect,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Render('pages/cart/cart')
  getCart() {}

  @Get('checkout')
  @Render('pages/cart/checkout')
  async getCheckout() {
    const stripePublicKey = this.configService.getOrThrow('stripe.publicKey');

    if (!stripePublicKey) {
      throw new NotFoundException('Stripe key not found');
    }

    return {
      stripePublicKey,
    };
  }

  @Post('create-checkout-session')
  @UseGuards(AuthGuard)
  async createCheckoutSession(@CurrentUser() user: UserPayload) {
    const { clientSecret, netTotalToStripe } =
      await this.cartService.createCheckoutSession(user);

    return {
      clientSecret,
      netTotalToStripe,
    };
  }

  @Get('order-confirmation')
  @Render('pages/cart/order-confirmation')
  getOrderConfirmation(@Query('order-id') orderId: number) {
    return {
      orderId,
    };
  }
}
