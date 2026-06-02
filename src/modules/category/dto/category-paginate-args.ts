import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ArgsType()
export class CategoryPaginationArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  limit?: number;
}
