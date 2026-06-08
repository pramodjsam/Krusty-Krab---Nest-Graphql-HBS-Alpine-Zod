import Alpine from 'alpinejs';
import { cartStore } from './cart';

export function registerStores() {
  Alpine.store('cart', cartStore());
}
