import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteResponseDto } from 'src/core/dto/delete-response.dto';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { FileValidationPipe } from 'src/core/pipe/file-validation.pipe';
import { UseInterceptors } from '@nestjs/common';
import { GqlCacheInterceptor } from 'src/core/interceptors/gql-cache.interceptor';
import { CacheTag } from 'src/core/decorators/cache-tag.decorator';
import { CategoryPaginationArgs } from './dto/category-paginate-args';
import { toPaginateQuery } from 'src/utils/pagination';
import { CategoryPaginated } from './dto/category-paginated';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => CategoryPaginated)
  @CacheTag('category:list')
  @UseInterceptors(GqlCacheInterceptor)
  @TransformDTO(Category)
  getCategories(@Args() args: CategoryPaginationArgs) {
    const query = toPaginateQuery(args);

    return this.categoryService.findAll(query);
  }

  @Query(() => Category, { nullable: true })
  @TransformDTO(Category)
  @CacheTag('category:detail')
  @UseInterceptors(GqlCacheInterceptor)
  getCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => Category)
  @TransformDTO(Category)
  createCategory(
    @Args('createCategory') createCategory: CreateCategoryDto,
    @Args(
      { name: 'file', type: () => GraphQLUpload, nullable: true },
      FileValidationPipe,
    )
    file?: FileUpload | null,
  ) {
    return this.categoryService.create(createCategory, file);
  }

  @Mutation(() => Category, { nullable: true })
  @TransformDTO(Category)
  updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateCategory') updateCategory: UpdateCategoryDto,
    @Args(
      { name: 'file', type: () => GraphQLUpload, nullable: true },
      FileValidationPipe,
    )
    file?: FileUpload | null,
  ) {
    return this.categoryService.update(id, updateCategory, file);
  }

  @Mutation(() => DeleteResponseDto, { nullable: true })
  @TransformDTO(DeleteResponseDto)
  deleteCategory(@Args('id', { type: () => Int }) id: number) {
    return this.categoryService.remove(id);
  }
}
