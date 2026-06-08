import { CartStore } from './store/cart';

declare module 'alpinejs' {
  interface Stores {
    cart: CartStore;
  }
}
