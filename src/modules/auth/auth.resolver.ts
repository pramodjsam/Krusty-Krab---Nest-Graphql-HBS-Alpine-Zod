import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { SignUpAuthDto } from './dto/sign-up-auth.dto';
import { AuthService } from './auth.service';
import { SignInAuthDto } from './dto/sign-in-auth.dto';

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
  signIn(
    @Args('signInAuth', { type: () => SignInAuthDto })
    signInAuth: SignInAuthDto,
  ) {
    return this.authService.signIn(signInAuth);
  }
}
