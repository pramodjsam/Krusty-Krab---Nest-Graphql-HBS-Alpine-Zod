import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RabbitmqModule } from 'src/core/rabbitmq/rabbitmq.module';
import { MatchPasswordConstraint } from './dto/reset-password.dto';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, UserResolver, MatchPasswordConstraint],
  imports: [TypeOrmModule.forFeature([User]), RabbitmqModule],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
