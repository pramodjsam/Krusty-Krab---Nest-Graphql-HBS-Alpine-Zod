import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Expose } from 'class-transformer';

@ObjectType()
@Entity()
export class CartItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field(() => Int)
  @Column({
    type: 'int',
  })
  @Expose()
  quantity: number;

  @Column()
  productId: number;

  @Field(() => Product)
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  @Expose()
  product: Product;

  @Column()
  cartId: number;

  @Field(() => Cart)
  @ManyToOne(() => Cart, (cart) => cart.cartItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  @Expose()
  cart: Cart;
}
