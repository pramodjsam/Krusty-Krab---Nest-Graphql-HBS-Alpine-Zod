import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

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

//
export function Paginated<T>(classRef: Type<T>) {
  @ObjectType(`${classRef.name}Paginated`)
  class PaginatedType {
    @Field(() => [classRef])
    data: T[];

    @Field(() => Pagination)
    pagination: Pagination;
  }
  return PaginatedType;
}
