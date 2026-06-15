import { User } from '@/generated/graphql';
import Alpine from 'alpinejs';

type UserType = Partial<User> | null;

export type ShippingAddress = {
  address: string;
  city: string;
  province: string;
  zipCode: string;
};

export type UserStore = {
  user: UserType;
  address: ShippingAddress | null;
  clear(): void;
  add(user: Partial<User>): void;
  getShippingAddress(): ShippingAddress | null;
  addShippingAddress(address: ShippingAddress): void;
  clearShippingAddress(): void;
};

export function userStore(): UserStore {
  return {
    user: Alpine.$persist<UserType>(null).as('user') as unknown as UserType,
    address: Alpine.$persist<UserType>(null).as(
      'shippingAddress',
    ) as unknown as ShippingAddress,
    clear() {
      this.user = null;
      this.address = null;
    },
    add(user: User) {
      this.user = user;
    },
    getShippingAddress() {
      return this.address;
    },
    addShippingAddress(address: ShippingAddress) {
      this.address = address;
    },
    clearShippingAddress() {
      this.address = null;
    },
  };
}
