import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, AuthResolver],
  imports: [UserModule],
  controllers: [AuthController],
})
export class AuthModule {}
