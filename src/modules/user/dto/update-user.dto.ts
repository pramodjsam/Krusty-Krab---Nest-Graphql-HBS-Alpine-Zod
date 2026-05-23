import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { CreateUserDto } from './create-user.dto';

@InputType()
export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, [
    'name',
    'email',
    'address',
    'city',
    'province',
    'zipCode',
    'phone',
  ]),
) {}
