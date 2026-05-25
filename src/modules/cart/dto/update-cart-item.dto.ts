import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

@InputType()
export class UpdateCartItemDto {
  @Field()
  @IsInt()
  @Min(1)
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
