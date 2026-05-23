import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

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

  constructor(id: number, name: string, email: string, accessToken: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.accessToken = accessToken;
  }
}
