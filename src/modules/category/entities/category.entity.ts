import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose, Type } from 'class-transformer';
import { Image } from 'src/modules/image/entities/image.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Category {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field()
  @Column()
  @Expose()
  name: string;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Field(() => Image, { nullable: true })
  @OneToOne(() => Image, { cascade: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @Expose()
  image?: Image;

  @Field(() => Date)
  @Type(() => Date)
  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @Field(() => Date)
  @Type(() => Date)
  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
