import { Controller, Get, Param, Render } from '@nestjs/common';
import { Args } from '@nestjs/graphql';

@Controller()
export class ProductController {
  @Get('user/admin/product')
  @Render('pages/admin/product/index')
  getAdminProduct() {
    return {
      layout: 'admin',
    };
  }

  @Get('user/admin/product/add')
  @Render('pages/admin/product/form')
  getAddAdminProduct() {
    return {
      layout: 'admin',
      title: 'Add Product',
      buttonText: 'Add',
      buttonClass: 'primary',
    };
  }

  @Get('user/admin/product/edit/:id')
  @Render('pages/admin/product/form')
  getEditAdminProduct(@Param('id') id: number) {
    return {
      layout: 'admin',
      title: 'Edit Product',
      buttonText: 'Update',
      buttonClass: 'warning',
      productId: id,
    };
  }
}
