import Alpine from 'alpinejs';
import { cartStore } from './cart';
import { userStore } from './user';

export function registerStores() {
  Alpine.store('cart', cartStore());
  Alpine.store('user', userStore());
}
