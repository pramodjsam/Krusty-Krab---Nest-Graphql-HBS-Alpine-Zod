import { InputType } from '@nestjs/graphql';
import { CreateCartDto } from './create-cart.dto';

@InputType()
export class UpdateUserCartDto extends CreateCartDto {}
