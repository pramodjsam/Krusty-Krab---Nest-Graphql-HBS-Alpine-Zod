import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class GenericResponseDto {
  @Expose()
  @Field(() => Boolean)
  success: boolean;

  @Expose()
  @Field()
  message: string;
}
