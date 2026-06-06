import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EMAIL_SERVICE_MQ, EMAIL_SERVICE_PUB } from 'src/core/constants';
import { ClientProxy } from '@nestjs/microservices';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailMailer } from 'src/core/email/interface/email.interface';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { generatePasswordResetToken } from 'src/utils/token.util';
import { SendResetTokenDto } from './dto/send-reset-token.dto';
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(EMAIL_SERVICE_MQ)
    private readonly emailClient: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const user = new User();
    Object.assign(user, createUserDto);

    return this.userRepository.save(user);
  }

  async findAll(query: PaginateQuery) {
    return await paginate(query, this.userRepository, {
      sortableColumns: ['id', 'name'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        email: [FilterOperator.EQ, FilterSuffix.NOT],
        role: [FilterOperator.EQ, FilterSuffix.NOT],
      },
      defaultLimit: 5,
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        cart: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: {
        cart: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'User removed successfully',
    };
  }

  async sendResetToken(sendResetTokenDto: SendResetTokenDto) {
    const user = await this.findByEmail(sendResetTokenDto.email);

    const resetToken = generatePasswordResetToken();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    user.resetToken = resetToken;
    user.resetTokenExpiry = expiry;

    const emailData: EmailMailer = {
      to: user.email,
      from: `admin@email.com <no-reply@email.com>`,
      subject: `Password Reset Request`,
      text: `Hello ${user.name}, your reset token is ${resetToken}`,
      html: `<h1>Hello ${user.name}, your reset token is ${resetToken}<h1>`,
    };

    this.emailClient.emit(EMAIL_SERVICE_PUB, emailData);

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto) {
    const user = await this.findByEmail(verifyTokenDto.email);

    if (!user.resetToken || user.resetToken !== verifyTokenDto.resetToken) {
      throw new BadRequestException('Please pass the same token');
    }

    return {
      success: true,
      message: 'Token verified successfully',
    };
  }

  async resetPassword(resetPassword: ResetPasswordDto) {
    const { email, resetToken, password } = resetPassword;

    const user = await this.findByEmail(email);

    if (!user.resetToken || user.resetToken !== resetToken) {
      throw new BadRequestException('Enter a valid token');
    }

    const now = new Date();
    if (!user.resetTokenExpiry || user.resetTokenExpiry < now) {
      throw new BadRequestException('Reset token has expired');
    }

    user.password = password;
    user.passwordChangedAt = new Date();
    user.resetToken = null;
    user.resetTokenExpiry = null;

    const emailData: EmailMailer = {
      to: user.email,
      from: `admin@email.com <no-reply@email.com>`,
      subject: 'Password Reset Successful',
      text: `Hello ${user.name}, your password has been changed successfully`,
      html: `<h1>Hello ${user.name}, your password has been changed successfully</h1>`,
    };

    this.emailClient.emit(EMAIL_SERVICE_PUB, emailData);

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }
}
