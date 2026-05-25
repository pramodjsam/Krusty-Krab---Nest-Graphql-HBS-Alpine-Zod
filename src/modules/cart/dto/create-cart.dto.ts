import { Field, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsPositive, Min } from 'class-validator';

@InputType()
export class CreateCartDto {
  @Field()
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @Field()
  @IsInt()
  @IsPositive()
  @Min(1)
  @IsNotEmpty()
  productId: number;
}
