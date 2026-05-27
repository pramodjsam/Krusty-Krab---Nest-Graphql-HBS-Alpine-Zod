import { InputType, PickType } from '@nestjs/graphql';
import { ResetPasswordDto } from './reset-password.dto';

@InputType()
export class VerifyTokenDto extends PickType(ResetPasswordDto, [
  'email',
  'resetToken',
]) {}
