import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { Category } from 'src/modules/category/entities/category.entity';
import { Image } from 'src/modules/image/entities/image.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Product {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field()
  @Column()
  @Expose()
  name: string;

  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
  })
  @Expose()
  price: number;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @Expose()
  category: Category;

  @Field(() => Image, { nullable: true })
  @OneToOne(() => Image, { cascade: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  @Expose()
  image?: Image;
}
