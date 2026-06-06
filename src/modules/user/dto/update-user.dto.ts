import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Role } from 'src/core/constants/index';
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
) {
  @Field(() => Role, { nullable: true })
  @IsOptional()
  role: Role;
}
