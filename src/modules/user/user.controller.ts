import { Controller, Get, Render } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('profile')
  @Render('pages/user/profile')
  getProfile() {}

  @Get('order')
  @Render('pages/user/order')
  getOrder() {}

  @Get('order/:id')
  @Render('pages/user/order-details')
  getOrderDetails() {}

  @Get('admin')
  @Render('pages/admin/index')
  getAdmin() {
    return {
      layout: 'admin',
    };
  }

  @Get('admin/order')
  @Render('pages/admin/order')
  getAdminOrder() {
    return {
      layout: 'admin',
    };
  }

  @Get('admin/user')
  @Render('pages/admin/user')
  getAdminUser() {
    return {
      layout: 'admin',
    };
  }
}
