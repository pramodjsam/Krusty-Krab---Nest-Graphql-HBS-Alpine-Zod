import { User } from '@/generated/graphql';
import Alpine from 'alpinejs';

type UserType = Partial<User> | null;

export type UserStore = {
  user: UserType;
  clear(): void;
  add(user: Partial<User>): void;
};

export function userStore(): UserStore {
  return {
    user: Alpine.$persist<UserType>(null).as('user') as unknown as UserType,
    clear() {
      this.user = null;
    },
    add(user: User) {
      this.user = user;
    },
  };
}
