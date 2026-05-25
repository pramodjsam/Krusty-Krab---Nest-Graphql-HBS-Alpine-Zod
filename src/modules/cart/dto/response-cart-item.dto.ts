import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';

@ObjectType()
export class ResponseCartItemDto {
  @Field(() => Int)
  @Expose()
  id: number;

  @Field(() => Int)
  @Expose()
  quantity: number;

  @Field(() => Int)
  @Transform(({ obj }) => Number(obj?.product?.id))
  @Expose()
  productId: number;

  @Field(() => Int)
  @Transform(({ obj }) => Number(obj?.cart?.id))
  @Expose()
  cartId: number;
}
