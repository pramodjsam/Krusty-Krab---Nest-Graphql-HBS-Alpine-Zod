import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;
}
