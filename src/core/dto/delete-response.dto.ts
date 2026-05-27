import { ObjectType } from '@nestjs/graphql';
import { GenericResponseDto } from './generic-response.dto';

@ObjectType()
export class DeleteResponseDto extends GenericResponseDto {}
