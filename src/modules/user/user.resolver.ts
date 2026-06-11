import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TransformDTO } from 'src/core/interceptors/transform-dto.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResponseDto } from 'src/core/dto/delete-response.dto';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserPayload } from './interfaces/user-payload.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { PasswordResetResponseDto } from './dto/password-reset-response.dto';
import { SendResetTokenDto } from './dto/send-reset-token.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PaginationArgs } from 'src/core/dto/pagination.args';
import { toPaginateQuery } from 'src/utils/pagination';
import { Paginated } from 'src/core/dto/entity-paginate.dto';

const UserPaginated = Paginated(User);

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserPaginated)
  @TransformDTO(User)
  getUsers(@Args() args: PaginationArgs) {
    const query = toPaginateQuery(args);

    return this.userService.findAll(query);
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

  @Mutation(() => User)
  @TransformDTO(User)
  @UseGuards(AuthGuard)
  updateCurrentUser(
    @CurrentUser() user: UserPayload,
    @Args('updateUser', { type: () => UpdateUserDto })
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Mutation(() => DeleteResponseDto)
  @TransformDTO(DeleteResponseDto)
  deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }

  @Query(() => User)
  @TransformDTO(User)
  @UseGuards(AuthGuard)
  currentUser(@CurrentUser() user: UserPayload) {
    return this.userService.findOne(user.id);
  }

  @Mutation(() => PasswordResetResponseDto)
  @TransformDTO(PasswordResetResponseDto)
  forgotPassword(
    @Args('sendResetToken', { type: () => SendResetTokenDto })
    sendResetToken: SendResetTokenDto,
  ) {
    return this.userService.sendResetToken(sendResetToken);
  }

  @Mutation(() => PasswordResetResponseDto)
  @TransformDTO(PasswordResetResponseDto)
  verifyToken(
    @Args('verifyToken', { type: () => VerifyTokenDto })
    verifyToken: VerifyTokenDto,
  ) {
    return this.userService.verifyToken(verifyToken);
  }

  @Mutation(() => PasswordResetResponseDto)
  @TransformDTO(PasswordResetResponseDto)
  resetPassword(
    @Args('resetPassword', { type: () => ResetPasswordDto })
    resetPassword: ResetPasswordDto,
  ) {
    return this.userService.resetPassword(resetPassword);
  }
}
