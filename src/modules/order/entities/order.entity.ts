import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentMethod } from 'src/core/constants';
import { Expose, Type } from 'class-transformer';

@ObjectType()
@Entity()
export class Order {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @Expose()
  user: User;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  @Expose()
  orderItem: OrderItem[];

  @Field(() => PaymentMethod, { defaultValue: PaymentMethod.CARD })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
  })
  @Expose()
  paymentMethod: PaymentMethod;

  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
  })
  @Expose()
  taxPrice: number;

  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
  })
  @Expose()
  shippingPrice: number;

  @Field(() => Float)
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
  })
  @Expose()
  totalPrice: number;

  @Field(() => Boolean, { defaultValue: false })
  @Column({
    type: 'boolean',
    default: false,
  })
  @Expose()
  isPaid: boolean;

  @Field(() => OrderStatus, { defaultValue: OrderStatus.PLACED })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PLACED,
  })
  @Expose()
  status: OrderStatus;

  @Field()
  @Column()
  @Expose()
  address: string;

  @Field()
  @Column()
  @Expose()
  city: string;

  @Field()
  @Column()
  @Expose()
  province: string;

  @Field()
  @Column()
  @Expose()
  zipCode: string;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  @Expose()
  deliveredAt?: Date | null;

  @Field(() => Date)
  @CreateDateColumn()
  @Expose()
  createdAt: Date;
}
