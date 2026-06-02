import { Controller, Get, Render } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('login')
  @Render('pages/auth/login')
  getLogin() {}

  @Get('register')
  @Render('pages/auth/register')
  getRegister() {}

  @Get('forgot-password')
  @Render('pages/auth/forgot-password')
  getForgotPassword() {}
}
