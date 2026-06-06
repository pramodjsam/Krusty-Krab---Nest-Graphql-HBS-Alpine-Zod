import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose, Type } from 'class-transformer';
import { Role } from 'src/core/constants';
import { Cart } from 'src/modules/cart/entity/cart.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Field()
  @Column()
  @Expose()
  name: string;

  @Field()
  @Column({ unique: true })
  @Expose()
  email: string;

  @Column()
  @Expose()
  password: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @Expose()
  address?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @Expose()
  city?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @Expose()
  province?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @Expose()
  zipCode?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  @Expose()
  phone?: string | null;

  @Field({ defaultValue: Role.USER })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @Expose()
  role: Role;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  @Expose()
  resetToken?: number | null;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  @Expose()
  resetTokenExpiry?: Date | null;

  @Field(() => Date)
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Expose()
  passwordChangedAt: Date;

  @Field(() => Cart, { nullable: true })
  @OneToOne(() => Cart, (cart) => cart.user, { nullable: true })
  @Expose()
  cart?: Cart | null;

  @Field(() => Date)
  @Type(() => Date)
  @CreateDateColumn()
  @Expose()
  createdAt: Date;
}
