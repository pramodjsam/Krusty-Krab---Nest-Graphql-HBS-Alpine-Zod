import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteResponseDto } from 'src/core/dto/delete.response.dto';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  @TransformDTO(Product)
  getProducts() {
    return this.productService.findAll();
  }

  @Query(() => Product)
  @TransformDTO(Product)
  getProduct(@Args('id', { type: () => Int }) id: number) {
    return this.productService.findOne(id);
  }

  @Mutation(() => Product)
  @TransformDTO(Product)
  createProduct(@Args('createProduct') createProduct: CreateProductDto) {
    return this.productService.create(createProduct);
  }

  @Mutation(() => Product)
  @TransformDTO(Product)
  updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateProduct') updateProduct: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProduct);
  }

  @Mutation(() => DeleteResponseDto)
  @TransformDTO(DeleteResponseDto)
  deleteProduct(@Args('id', { type: () => Int }) id: number) {
    return this.productService.delete(id);
  }
}
