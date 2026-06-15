import {
  CartItem,
  Image,
  Product,
  UserCartDocument,
  UserCartQuery,
  UserCartQueryVariables,
} from '@/generated/graphql';
import { removeFromCart, updateCartItem } from '@/shared/cart';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import { shippingAddressCartPage } from '@/types';
import Alpine from 'alpinejs';

type CItem = Omit<Partial<CartItem>, 'product' | 'image'> & {
  product: Omit<Partial<Product>, 'image'> & {
    image: Partial<Image> | null;
  };
};

type CartPage = {
  loading: boolean;
  errors: Record<string, string>;
  qtyOptions: number[];
  cartItems: CItem[];
  shippingForm: {
    user: string;
    email: string;
    // phone: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
  };
  total: number;
  tax: number;
  deliveryFee: number;
  netTotal: number;
  fetchCartItems(): Promise<void>;
  fetchUserFromStore(): void;
  handleRemoveFromCart(product: Product): Promise<void>;
  handleQuantityChange(product: Product, quantity: number): Promise<void>;
  handleProceedToPayment(): Promise<void>;
  init(): Promise<void>;
};

// TODO: Improvements
// Make the cart single source of truth
// NOTE: Made this way because the cart page requires product image
// cart from backend "now" only gives productId and cartId without image
// Single source of truth prevents updating cart item from store and this file
export function cartPage(): CartPage {
  return {
    loading: false,
    errors: {},
    qtyOptions: Array.from({ length: 10 }, (_, i) => i + 1),
    cartItems: [],
    shippingForm: {
      user: '',
      email: '',
      // phone: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
    },
    get total() {
      return this.cartItems.reduce((sum, item: CItem) => {
        const price = Number(item.product.price);
        const qty = Number(item.quantity ?? 1);
        return sum + price * qty;
      }, 0);
    },
    get tax() {
      return this.total * 0.13;
    },
    get deliveryFee() {
      return this.cartItems.length > 0 ? 5 : 0;
    },
    get netTotal() {
      return this.total + this.tax + this.deliveryFee;
    },
    async fetchCartItems() {
      this.loading = true;

      try {
        const result = await graphqlRequest<
          UserCartQuery,
          UserCartQueryVariables
        >(UserCartDocument, {});

        if (result.data) {
          const cartItems = result.data.cart?.cartItem;

          if (cartItems) {
            this.cartItems = cartItems.map((item) => ({
              ...item,
              quantity: Number(item.quantity ?? 1),
            }));
          } else {
            notyNotification('No items in cart');
            window.location.href = '/';
          }
        } else {
          if (result.error.code === 'UNAUTHENTICATED') {
            Alpine.store('user').clear();
            window.location.href = '/auth/login';
            return;
          }
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    fetchUserFromStore() {
      const userStore = Alpine.store('user');
      const localStoreUser = userStore.user;
      const localStoreAddress = userStore.getShippingAddress();

      if (localStoreUser) {
        this.shippingForm.user = localStoreUser.name ?? '';
        this.shippingForm.email = localStoreUser.email ?? '';
      }

      if (localStoreAddress) {
        this.shippingForm.address = localStoreAddress.address ?? '';
        this.shippingForm.city = localStoreAddress.city ?? '';
        this.shippingForm.province = localStoreAddress.province ?? '';
        this.shippingForm.zipCode = localStoreAddress.zipCode ?? '';
      }
    },
    async handleRemoveFromCart(product: Product) {
      await removeFromCart(product);

      this.cartItems = this.cartItems.filter(
        (item) => item.product.id !== product.id,
      );
    },
    async handleQuantityChange(product: Product) {
      const cartItem = this.cartItems.find(
        (item) => item.product.id === product.id,
      );

      await updateCartItem(product, cartItem?.quantity ?? 1);
    },
    async handleProceedToPayment() {
      const result = shippingAddressCartPage.safeParse(this.shippingForm);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;

          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });

        this.errors = fieldErrors;
        notyNotification('Please fix the errors', 'error');
        return;
      }

      const shippingAddress = {
        address: this.shippingForm.address,
        city: this.shippingForm.city,
        province: this.shippingForm.province,
        zipCode: this.shippingForm.zipCode,
      };

      Alpine.store('user').addShippingAddress(shippingAddress);

      window.location.href = '/cart/checkout';
    },
    async init() {
      await this.fetchCartItems();
      this.fetchUserFromStore();
    },
  };
}
