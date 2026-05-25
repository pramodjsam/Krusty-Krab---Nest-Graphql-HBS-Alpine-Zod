import { registerEnumType } from '@nestjs/graphql';

export const CLOUDINARY = 'CLOUDINARY';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

export const TWO_MB = 2097152;

export enum OrderStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PREPARATION = 'PREPARATION',
  DELIVERY = 'DELIVERY',
  COMPLETE = 'COMPLETE',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
