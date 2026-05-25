import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Expose } from 'class-transformer';

@ObjectType()
@Entity()
export class OrderItem {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field(() => Int)
  @Column()
  @Expose()
  quantity: number;

  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
  })
  @Expose()
  price: number;

  @Field(() => Product)
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn()
  @Expose()
  product: Product;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.orderItem)
  @JoinColumn()
  @Expose()
  order: Order;
}
