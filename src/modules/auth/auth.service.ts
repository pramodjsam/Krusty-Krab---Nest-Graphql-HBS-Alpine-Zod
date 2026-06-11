import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignUpAuthDto } from './dto/sign-up-auth.dto';
import { generateToken } from 'src/utils/token.util';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { ResponseAuthDto } from './dto/response-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signUp(signUpAuthDto: SignUpAuthDto) {
    const user = await this.userService.create(signUpAuthDto);

    const accessToken = await generateToken(user, this.jwtService);

    return new ResponseAuthDto(
      user.id,
      user.name,
      user.email,
      user.role,
      accessToken,
    );
  }

  async signIn(signInAuthDto: SignInAuthDto) {
    const { email, password } = signInAuthDto;
    const user = await this.userService.findByEmail(email);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Wrong Credentials');
    }

    const accessToken = await generateToken(user, this.jwtService);
    return new ResponseAuthDto(
      user.id,
      user.name,
      email,
      user.role,
      accessToken,
    );
  }
}
