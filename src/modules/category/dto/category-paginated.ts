import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';

@ObjectType()
export class Pagination {
  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class CategoryPaginated {
  @Field(() => [Category])
  data: Category[];

  @Field(() => Pagination)
  pagination: Pagination;
}
