import {
  CartItem,
  CreateOrderDocument,
  CreateOrderMutation,
  CreateOrderMutationVariables,
  Image,
  Product,
  UserCartDocument,
  UserCartQuery,
  UserCartQueryVariables,
} from '@/generated/graphql';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import Alpine from 'alpinejs';
import { ShippingAddress } from '@/store/user';

type CItem = Omit<Partial<CartItem>, 'product' | 'image'> & {
  product: Omit<Partial<Product>, 'image'> & {
    image: Partial<Image> | null;
  };
};

type CheckoutPage = {
  loading: boolean;
  stripeReady: boolean;
  stripe: Stripe | null;
  stripeElements: StripeElements | null;
  errors: Record<string, string>;
  cartItems: CItem[];
  total: number;
  tax: number;
  deliveryFee: number;
  netTotal: number;
  netTotalToStripe: number;
  fullAddress: string;
  fetchCartItems(): Promise<void>;
  mountStripeCheckout(publicKey: string): Promise<void>;
  handlePaymentSubmit(): Promise<void>;
  init(): Promise<void>;
};

export function checkoutPage(): CheckoutPage {
  return {
    loading: false,
    stripeReady: false,
    stripe: null,
    stripeElements: null,
    errors: {},
    cartItems: [],
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
    get fullAddress() {
      const address = Alpine.store('user').getShippingAddress();

      return `${address?.address}, ${address?.city}, ${address?.province} - ${address?.zipCode}`;
    },
    netTotalToStripe: 0,
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
    async mountStripeCheckout(publicKey: string) {
      this.stripeReady = false;

      try {
        this.stripe = await loadStripe(publicKey);

        const response = await fetch('/cart/create-checkout-session', {
          method: 'POST',
          credentials: 'include',
        });

        const { clientSecret, netTotalToStripe } = await response.json();

        if (!this.stripe) return;

        this.stripeElements = this.stripe.elements({
          clientSecret,
        });

        const paymentElement = this.stripeElements.create('payment');

        paymentElement.mount('#payment-element');

        paymentElement.on('ready', () => {
          this.stripeReady = true;
          this.netTotalToStripe = netTotalToStripe;
        });
      } catch {
        notyNotification('Something went wrong, try again later', 'error');
      }
    },
    async handlePaymentSubmit() {
      try {
        const addressStore = Alpine.store('user').getShippingAddress();

        if (!this.stripe || !this.stripeElements) {
          throw new Error('INTERNAL SERVER ERROR');
        }

        if (
          !(
            addressStore &&
            addressStore.address &&
            addressStore.city &&
            addressStore.province &&
            addressStore.zipCode
          )
        ) {
          throw new Error('Please fill in the shipping address');
        }

        const { error, paymentIntent } = await this.stripe.confirmPayment({
          elements: this.stripeElements,
          redirect: 'if_required',
        });

        if (error) {
          throw new Error(error.message);
        } else {
          switch (paymentIntent.status) {
            case 'succeeded':
              const variables = {
                createOrder: {
                  address: addressStore.address,
                  city: addressStore.city,
                  province: addressStore.province,
                  zipCode: addressStore.zipCode,
                },
              };
              const result = await graphqlRequest<
                CreateOrderMutation,
                CreateOrderMutationVariables
              >(CreateOrderDocument, variables);

              if (result.data) {
                const cartStore = Alpine.store('cart');
                cartStore.clear();

                window.location.href = `/cart/order-confirmation?order-id=${result.data.order.id}`;
              } else {
                throw new Error(result.error.message);
              }
              break;
            case 'processing':
              notyNotification('Your payment is processing.', 'success');
            case 'requires_payment_method':
              notyNotification(
                'Your payment was not successful, please try again',
                'error',
              );
              break;
            default:
              notyNotification('Something wrong', 'error');
              break;
          }
        }
      } catch (error) {
        notyNotification('Internal Server Error', 'error');
      }
    },
    async init() {
      await this.fetchCartItems();
    },
  };
}
