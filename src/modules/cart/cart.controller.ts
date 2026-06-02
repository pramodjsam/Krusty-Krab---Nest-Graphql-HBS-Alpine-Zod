import { Controller, Get, Render } from '@nestjs/common';

@Controller('cart')
export class CartController {
  @Get()
  @Render('pages/cart/cart')
  getCart() {}

  @Get('checkout')
  @Render('pages/cart/checkout')
  getCheckout() {}

  @Get('order-confirmation')
  @Render('pages/cart/order-confirmation')
  getOrderConfirmation() {}
}
