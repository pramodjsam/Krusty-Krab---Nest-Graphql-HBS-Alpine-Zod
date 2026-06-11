import { Controller, Get, Param, Render } from '@nestjs/common';
import { OrderStatus } from 'src/core/constants/index';

@Controller()
export class OrderController {
  @Get('user/admin/order')
  @Render('pages/admin/order')
  getAdminOrder() {
    return {
      layout: 'admin',
      orderStatus: OrderStatus,
    };
  }

  @Get('user/order')
  @Render('pages/user/order')
  getOrder() {}

  @Get('user/order/:id')
  @Render('pages/user/order-details')
  getOrderDetails(@Param('id') id: number) {
    return {
      id,
    };
  }
}
