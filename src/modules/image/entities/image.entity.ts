import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Image {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field()
  @Column()
  @Expose()
  url: string;

  @Field()
  @Column()
  @Expose()
  publicId: string;

  constructor(url, publicId) {
    this.url = url;
    this.publicId = publicId;
  }
}
