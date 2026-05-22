import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateImageDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  base64String: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  publicId: string;
}
