import { Product } from '@/generated/graphql';
import { notyNotification } from '@/shared/notification';
import Alpine from 'alpinejs';

type CartItem = Partial<Product> & {
  quantity: number;
};

export type CartStore = {
  items: CartItem[];
  add(product: Product): void;
  remove(product: Product): void;
  exists(product: Product): boolean;
  count(): number;
};

export function cartStore(): CartStore {
  return {
    items: Alpine.$persist<CartItem[]>([]).as('cart') as unknown as CartItem[],
    add(product: Product) {
      const existing = this.items.find((item) => item.id === product.id);

      if (existing) {
        existing.quantity = Math.max(10, existing.quantity + 1);
      } else {
        this.items.push({
          ...product,
          quantity: 1,
        });
      }

      notyNotification(`${product.name} added to cart successfully`, 'success');
    },
    remove(product: Product) {
      const index = this.items.findIndex((item) => item.id === product.id);

      if (index !== -1) {
        this.items[index].quantity -= 1;

        if (this.items[index].quantity <= 0) {
          this.items.splice(index, 1);

          notyNotification(
            `${product.name} removed from cart successfully`,
            'success',
          );
        } else {
          notyNotification(
            `${product.name} updated cart successfully`,
            'success',
          );
        }
      }
    },
    exists(product: Product) {
      return this.items.some((item) => item.id === product.id);
    },
    count() {
      return this.items.length;
    },
  };
}
