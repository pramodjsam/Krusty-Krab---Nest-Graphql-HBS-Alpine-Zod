import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsPositive, ValidateNested } from 'class-validator';

@InputType()
export class SyncCartItemInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  quantity: number;
}

@InputType()
export class SyncCartInput {
  @Field(() => [SyncCartItemInput])
  @Type(() => SyncCartItemInput)
  @ValidateNested({ each: true })
  items: SyncCartItemInput[];
}
