import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller()
export class CategoryController {
  @Get('user/admin/category')
  @Render('pages/admin/category/index')
  async getAdminCategory() {
    return {
      layout: 'admin',
    };
  }

  @Get('user/admin/category/add')
  @Render('pages/admin/category/form')
  getAdminCategoryAdd() {
    return {
      layout: 'admin',
      title: 'Add Category',
      buttonText: 'Add',
      buttonClass: 'primary',
    };
  }

  @Get('user/admin/category/edit/:id')
  @Render('pages/admin/category/form')
  getAdminCategoryEdit(@Param('id') id: number) {
    return {
      layout: 'admin',
      title: 'Edit Category',
      buttonText: 'Update',
      buttonClass: 'warning',
      categoryId: id,
    };
  }
}
