import { Product } from '@/generated/graphql';
import Alpine from 'alpinejs';

type CartItem = {
  quantity: number;
  productId: number;
};

export type CartStore = {
  items: CartItem[];
  add(product: Product): void;
  remove(product: Product): void;
  update(productId: number, quantity: number): void;
  get(productId: number): CartItem | undefined;
  exists(product: Product): boolean;
  count(): number;
};

export function cartStore(): CartStore {
  return {
    items: Alpine.$persist<CartItem[]>([]).as('cart') as unknown as CartItem[],
    add(product: Product) {
      const existing = this.items.find((item) => item.productId === product.id);

      if (existing) {
        existing.quantity = Math.max(10, existing.quantity + 1);
      } else {
        this.items.push({
          quantity: 1,
          productId: product.id,
        });
      }
    },
    remove(product: Product) {
      const index = this.items.findIndex(
        (item) => item.productId === product.id,
      );

      if (index !== -1) {
        this.items[index].quantity -= 1;

        if (this.items[index].quantity <= 0) {
          this.items.splice(index, 1);
        }
      }
    },
    update(productId: number, quantity: number) {
      const item = this.items.find((i) => i.productId === productId);

      if (item) {
        item.quantity = quantity;
      }
    },
    get(productId: number) {
      return this.items.find((i) => i.productId === productId);
    },
    exists(product: Product) {
      return this.items.some((item) => item.productId === product.id);
    },
    count() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
  };
}
