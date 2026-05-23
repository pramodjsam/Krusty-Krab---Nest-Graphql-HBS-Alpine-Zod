import { InputType, PickType } from '@nestjs/graphql';
import { SignUpAuthDto } from './sign-up-auth.dto';

@InputType()
export class SignInAuthDto extends PickType(SignUpAuthDto, [
  'email',
  'password',
]) {}
