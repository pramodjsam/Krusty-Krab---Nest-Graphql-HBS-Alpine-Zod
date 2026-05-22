import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

export function TransformDTO<T>(
  dto: ClassConstructor<T>,
): MethodDecorator & ClassDecorator {
  return UseInterceptors(new TransformDTOInterceptor(dto));
}

@Injectable()
export class TransformDTOInterceptor<T> implements NestInterceptor {
  constructor(private readonly dtoClass: ClassConstructor<T>) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        // paginated NOTE: paginated data only contains data.data, its
        // structure from nestjs-paginate
        if (data && data.data) {
          return {
            data: plainToInstance(this.dtoClass, data, {
              excludeExtraneousValues: true,
            }),
            pagination: {
              itemsPerPage: data.meta.itemsPerPage,
              totalItems: data.meta?.totalItems,
              currentPage: data.meta?.currentPage,
              totalPages: data.meta?.totalPages,
            },
          };
        }

        return plainToInstance(this.dtoClass, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
