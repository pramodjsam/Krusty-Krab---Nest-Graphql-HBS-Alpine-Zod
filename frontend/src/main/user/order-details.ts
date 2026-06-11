import {
  Category,
  GetOrderDocument,
  GetOrderQuery,
  GetOrderQueryVariables,
  Order,
  OrderItem,
  Product,
  User,
} from '@/generated/graphql';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';

type OrderDetailsPage = {
  loading: boolean;
  order:
    | (Omit<Partial<Order>, 'user' | 'orderItem'> & {
        user: Partial<User> | null;
        orderItem:
          | (Omit<Partial<OrderItem>, 'product'> & {
              product:
                | (Omit<Partial<Product>, 'category'> & {
                    category: Partial<Category> | null;
                  })
                | null;
            })[]
          | null;
      })
    | null;
  statuses: Record<string, string>[];
  fetchOrder(): Promise<void>;
  getCurrentStatusIndex(): number;
  getStatusClass(index: number, icon: string): string;
  init(): Promise<void>;
};

export function orderDetailsPage(id: number): OrderDetailsPage {
  return {
    loading: false,
    order: null,
    statuses: [
      {
        value: 'PLACED',
        label: 'Order Placed',
        icon: 'icon-placed',
      },
      {
        value: 'CONFIRMED',
        label: 'Order Confirmed',
        icon: 'icon-confirmed',
      },
      {
        value: 'PREPARATION',
        label: 'Preparation',
        icon: 'icon-preparation',
      },
      {
        value: 'DELIVERY',
        label: 'Out for Delivery',
        icon: 'icon-delivery',
      },
      {
        value: 'COMPLETE',
        label: 'Completed',
        icon: 'icon-completed',
      },
    ],
    async fetchOrder() {
      this.loading = true;

      try {
        const variables = {
          id: Number(id),
        };

        const result = await graphqlRequest<
          GetOrderQuery,
          GetOrderQueryVariables
        >(GetOrderDocument, variables);

        if (result.data) {
          this.order = result.data.order;
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    getCurrentStatusIndex() {
      return this.statuses.findIndex((s) => s.value === this.order?.status);
    },
    getStatusClass(index: number, icon: string) {
      if (index < this.getCurrentStatusIndex()) {
        return `step-completed ${icon}`;
      }
      if (index === this.getCurrentStatusIndex()) {
        return `current ${icon}`;
      }

      return `${icon}`;
    },
    async init() {
      this.fetchOrder();
    },
  };
}
