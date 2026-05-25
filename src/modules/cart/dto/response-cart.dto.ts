import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ResponseCartItemDto } from './response-cart-item.dto';
import { Expose, Transform, Type } from 'class-transformer';

@ObjectType()
export class ResponseCartDto {
  @Field(() => Int)
  @Expose()
  id: number;

  @Field()
  @Transform(({ obj }) => Number(obj?.user?.id))
  @Expose()
  userId: number;

  @Field(() => [ResponseCartItemDto])
  @Type(() => ResponseCartItemDto)
  @Expose()
  cartItem: ResponseCartItemDto[];
}
