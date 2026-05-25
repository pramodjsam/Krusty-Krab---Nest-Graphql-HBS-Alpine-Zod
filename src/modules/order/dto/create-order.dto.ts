import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  Min,
} from 'class-validator';

@InputType()
export class CreateOrderDto {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  productIds: [number];
}
