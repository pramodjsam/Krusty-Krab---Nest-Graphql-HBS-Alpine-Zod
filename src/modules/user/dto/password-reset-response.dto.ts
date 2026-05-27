import { ObjectType } from '@nestjs/graphql';
import { GenericResponseDto } from 'src/core/dto/generic-response.dto';

@ObjectType()
export class PasswordResetResponseDto extends GenericResponseDto {}
