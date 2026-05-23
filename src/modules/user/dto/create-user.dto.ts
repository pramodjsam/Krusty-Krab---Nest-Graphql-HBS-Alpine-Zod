import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  password: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  address?: string | null;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  city?: string | null;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  province?: string | null;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  zipCode?: string | null;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  phone?: string | null;
}
