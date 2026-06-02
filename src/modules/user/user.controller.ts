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

  @Get('admin/product')
  @Render('pages/admin/product/index')
  getAdminProduct() {
    return {
      layout: 'admin',
    };
  }

  @Get('admin/product/add')
  @Render('pages/admin/product/form')
  getAddAdminProduct() {
    return {
      layout: 'admin',
      title: 'Add Product',
      buttonText: 'Add',
      buttonClass: 'primary',
      action: '/admin/product/create',
    };
  }

  @Get('admin/product/edit')
  @Render('pages/admin/product/form')
  getEditAdminProduct() {
    return {
      layout: 'admin',
      title: 'Edit Product',
      buttonText: 'Update',
      buttonClass: 'warning',
      action: '/admin/product/update',
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
