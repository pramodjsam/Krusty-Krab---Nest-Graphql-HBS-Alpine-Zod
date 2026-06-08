import { CartStore } from './store/cart';
import { UserStore } from './store/user';

declare module 'alpinejs' {
  interface Stores {
    cart: CartStore;
    user: UserStore;
  }
}
