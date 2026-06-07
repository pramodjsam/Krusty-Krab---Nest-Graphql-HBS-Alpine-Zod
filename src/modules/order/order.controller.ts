import { Controller, Get, Render } from '@nestjs/common';
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
}
