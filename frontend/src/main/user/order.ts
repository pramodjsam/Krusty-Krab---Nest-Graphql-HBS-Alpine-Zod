import {
  Order,
  UserOrdersDocument,
  UserOrdersQuery,
  UserOrdersQueryVariables,
} from '@/generated/graphql';
import { paginationPages } from '@/shared/common';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';

type OrderPage = {
  loading: boolean;
  orders: Partial<Order>[];
  currentPage: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'DESC' | 'ASC';
  searchText: string;
  goToPage(page: number): void;
  visiblePages(): {
    number: number | null;
    text: string;
    key: string;
    isEllipsis: boolean;
  }[];
  sort(column: string): void;
  handleSearchSubmit(): void;
  clearSearch(): void;
  fetchOrders(page?: number, limit?: number): Promise<void>;
  init(): Promise<void>;
};

export function orderPage(): OrderPage {
  return {
    loading: false,
    orders: [],
    currentPage: 1,
    totalPages: 1,
    sortBy: 'id',
    sortOrder: 'DESC',
    searchText: '',
    async fetchOrders(page: number = 1, limit: number = 5) {
      this.loading = true;

      try {
        const variables = {
          page,
          limit,
          sort: [[this.sortBy, this.sortOrder]],
          search: this.searchText.trim(),
        };

        const result = await graphqlRequest<
          UserOrdersQuery,
          UserOrdersQueryVariables
        >(UserOrdersDocument, variables);

        if (result.data) {
          this.orders = result.data.orders.data;
          this.totalPages = result.data.orders.pagination.totalPages;
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    goToPage(page: number) {
      if (page < 1 || page > this.totalPages) return;

      this.fetchOrders(page);
    },
    visiblePages() {
      return paginationPages(this.totalPages, this.currentPage);
    },
    sort(column: string) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
      } else {
        this.sortBy = column;
        this.sortOrder = 'ASC';
      }

      this.fetchOrders(1);
    },
    handleSearchSubmit() {
      const searchText = this.searchText.trim();
      if (!searchText) return;

      this.fetchOrders(1);
    },
    clearSearch() {
      this.searchText = '';
      this.fetchOrders(1);
    },
    async init() {
      await this.fetchOrders();
    },
  };
}
