import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentMethod } from 'src/core/constants';

@InputType()
export class UpdateOrderDto {
  @Field(() => PaymentMethod, { nullable: true })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  deliveredAt?: string;
}
