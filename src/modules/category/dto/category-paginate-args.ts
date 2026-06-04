import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

type SortOrder = 'ASC' | 'DESC';

@InputType()
class SortInput {
  @Field()
  key: string;

  @Field()
  order: 'ASC' | 'DESC';
}

@ArgsType()
export class CategoryPaginationArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  limit?: number;

  @Field(() => [[String]], { nullable: 'itemsAndList' })
  @IsOptional()
  sort?: [string, SortOrder][];

  @Field(() => String, { nullable: true })
  @IsOptional()
  search?: string;
}
