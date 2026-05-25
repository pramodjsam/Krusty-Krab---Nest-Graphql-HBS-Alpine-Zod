import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Expose } from 'class-transformer';

@ObjectType()
@Entity()
export class Cart {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field(() => User)
  @OneToOne(() => User)
  @JoinColumn()
  @Expose()
  user: User;

  @Field(() => [CartItem], { nullable: true })
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Expose()
  cartItem: CartItem[] | null;
}
