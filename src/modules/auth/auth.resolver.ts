import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { GenericResponseDto } from 'src/core/dto/generic-response.dto';
import { SignUpAuthDto } from './dto/sign-up-auth.dto';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { Response } from 'express';

@Resolver(() => ResponseAuthDto)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => ResponseAuthDto)
  @TransformDTO(ResponseAuthDto)
  signUp(
    @Args('signUpAuth', { type: () => SignUpAuthDto })
    signUpAuth: SignUpAuthDto,
  ) {
    return this.authService.signUp(signUpAuth);
  }

  @Mutation(() => ResponseAuthDto)
  @TransformDTO(ResponseAuthDto)
  async signIn(
    @Args('signInAuth', { type: () => SignInAuthDto })
    signInAuth: SignInAuthDto,
    @Context() ctx: { res: Response },
  ) {
    const result = await this.authService.signIn(signInAuth);

    ctx.res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, //1 day
    });

    return result;
  }

  @Mutation(() => GenericResponseDto)
  @TransformDTO(GenericResponseDto)
  async logout(@Context() ctx: { res: Response }) {
    ctx.res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      success: true,
      message: 'Logout successfully',
    };
  }
}
