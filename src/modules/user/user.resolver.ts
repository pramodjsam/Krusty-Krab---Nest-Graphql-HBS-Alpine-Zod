import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResponseDto } from 'src/core/dto/delete.response.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserPayload } from './interfaces/user-payload.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @TransformDTO(User)
  getUsers() {
    return this.userService.findAll();
  }

  @Query(() => User)
  @TransformDTO(User)
  getUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  @TransformDTO(User)
  createUser(
    @Args('createUser', { type: () => CreateUserDto })
    createUserDto: CreateUserDto,
  ) {
    return this.userService.create(createUserDto);
  }

  @Mutation(() => User)
  @TransformDTO(User)
  updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateUser', { type: () => UpdateUserDto })
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Mutation(() => DeleteResponseDto)
  @TransformDTO(DeleteResponseDto)
  deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  currentUser(@CurrentUser() user: UserPayload) {
    return this.userService.findOne(user.id);
  }
}
