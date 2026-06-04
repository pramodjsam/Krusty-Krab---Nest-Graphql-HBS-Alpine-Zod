import { PaginateQuery } from 'nestjs-paginate';

export function toPaginateQuery(args: any): PaginateQuery {
  return {
    page: args.page ?? 1,
    limit: args.limit ?? 5,
    sortBy: args.sort ?? [['id', 'DESC']],
    search: args.search,
    path: '',
  };
}
