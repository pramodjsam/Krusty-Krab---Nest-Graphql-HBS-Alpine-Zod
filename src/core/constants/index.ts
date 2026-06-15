import { registerEnumType } from '@nestjs/graphql';

export const CLOUDINARY = 'CLOUDINARY';
export const REDIS_CLIENT = 'REDIS_CLIENT';
export const STRIPE_CLIENT = "STRIPE_CLIENT";

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
registerEnumType(Role, {
  name: 'Role',
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

export const EMAIL_SERVICE_MQ = 'EMAIL_SERVICE_MQ';
export const EMAIL_SERVICE_PUB = 'EMAIL_SERVICE.pub';
