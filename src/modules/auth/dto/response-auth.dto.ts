import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { Role } from 'src/core/constants/index';

@ObjectType()
export class ResponseAuthDto {
  @Field(() => Int)
  @Expose()
  id: number;

  @Field()
  @Expose()
  name: string;

  @Field()
  @Expose()
  email: string;

  @Field()
  @Expose()
  accessToken: string;

  @Field(() => Role)
  @Expose()
  role: Role;

  constructor(
    id: number,
    name: string,
    email: string,
    role: Role,
    accessToken: string,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.accessToken = accessToken;
    this.role = role;
  }
}
