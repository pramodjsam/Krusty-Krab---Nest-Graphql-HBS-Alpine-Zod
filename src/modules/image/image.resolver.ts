import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ImageService } from './image.service';
import { Image } from './entities/image.entity';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { streamToBase64Image } from 'src/utils/file.util';
import { DeleteResponseDto } from 'src/core/dto/delete-response.dto';

@Resolver(() => Image)
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Query(() => Image)
  getImage(@Args('id', { type: () => Int }) id: number) {
    return this.imageService.findOne(id);
  }

  @Mutation(() => Image)
  async uploadImage(
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ) {
    return this.imageService.upload(
      await streamToBase64Image(file.createReadStream(), file.mimetype),
    );
  }

  @Mutation(() => DeleteResponseDto)
  deleteImage(@Args('id', { type: () => Int }) id: number) {
    return this.imageService.remove(id);
  }

  @Mutation(() => Image)
  async updateImage(
    @Args('publicId') publicId: string,
    @Args({ name: 'file', type: () => GraphQLUpload })
    file: FileUpload,
  ) {
    return this.imageService.update(
      await streamToBase64Image(file.createReadStream(), file.mimetype),
      publicId,
    );
  }
}
