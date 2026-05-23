import { InputType } from '@nestjs/graphql';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';

@InputType()
export class SignUpAuthDto extends CreateUserDto {}
