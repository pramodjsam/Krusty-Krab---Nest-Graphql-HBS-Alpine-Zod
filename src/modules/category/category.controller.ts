import { Controller, Get, Query, Render } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PaginateQuery } from 'nestjs-paginate';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('user/admin/category')
  @Render('pages/admin/category/index')
  async getAdminCategory(@Query() query: PaginateQuery) {
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
      action: '/admin/category/create',
    };
  }

  @Get('user/admin/category/edit')
  @Render('pages/admin/category/form')
  getAdminCategoryEdit() {
    return {
      layout: 'admin',
      title: 'Edit Category',
      buttonText: 'Update',
      buttonClass: 'warning',
      action: '/admin/category/update',
    };
  }
}
