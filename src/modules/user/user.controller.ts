import { Controller, Get, Render } from '@nestjs/common';
import { Role } from 'src/core/constants/index';

@Controller('user')
export class UserController {
  @Get('profile')
  @Render('pages/user/profile')
  getProfile() {}

  @Get('admin')
  @Render('pages/admin/index')
  getAdmin() {
    return {
      layout: 'admin',
    };
  }

  @Get('admin/user')
  @Render('pages/admin/user')
  getAdminUser() {
    return {
      layout: 'admin',
      role: Role,
    };
  }
}
