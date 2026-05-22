import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

@InputType()
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsNumber()
  @IsPositive()
  @Field(() => Float)
  price: number;

  @IsNumber()
  @IsPositive()
  @Field(() => Int)
  categoryId: number;
}
