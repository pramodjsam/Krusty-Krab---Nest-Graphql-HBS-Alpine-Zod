import {
  GetOrdersDocument,
  GetOrdersQuery,
  GetOrdersQueryVariables,
  Order,
  UpdateOrderDocument,
  UpdateOrderMutation,
  UpdateOrderMutationVariables,
  User,
} from '../../generated/graphql';
import { paginationPages } from '../../shared/common';
import { graphqlRequest } from '../../shared/graphqlClient';
import { notyNotification } from '../../shared/notification';

type OrderAdminPage = {
  orders: (Omit<Partial<Order>, 'user'> & {
    user?: Partial<User> | null;
  })[];
  form: {
    id: number | null;
  };
  loading: boolean;
  editingId: null | number;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'DESC' | 'ASC';
  searchText: string;
  fetchPage(page?: number, limit?: number): Promise<void>;
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
  startEdit(order: Partial<Order>): void;
  saveEdit(): Promise<void>;
  init(): void;
};

export function orderAdminPage(): OrderAdminPage {
  return {
    orders: [],
    form: {
      id: null,
    },
    editingId: null,
    loading: false,
    currentPage: 1,
    totalPages: 1,
    sortBy: 'id',
    sortOrder: 'DESC',
    searchText: '',
    async fetchPage(page = 1, limit = 3) {
      this.loading = true;
      this.currentPage = page;
      const variables = {
        page,
        limit,
        sort: [[this.sortBy, this.sortOrder]],
        search: this.searchText.trim(),
      };
      try {
        const result = await graphqlRequest<
          GetOrdersQuery,
          GetOrdersQueryVariables
        >(GetOrdersDocument, variables, { auth: true });

        if (result.data) {
          const data = result.data.orders;
          this.orders = data.data;
          this.totalPages = data?.pagination.totalPages;
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

      this.fetchPage(page);
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

      this.fetchPage(1);
    },
    handleSearchSubmit() {
      const searchText = this.searchText.trim();
      if (!searchText) return;

      this.fetchPage(1);
    },
    clearSearch() {
      this.searchText = '';
      this.fetchPage(1);
    },
    startEdit(order: Partial<Order>) {
      if (order.id) {
        this.form.id = order.id;
      }
    },
    async saveEdit() {
      if (!this.form.id) return;

      try {
        const editedOrder = this.orders.find(
          (order) => order.id === this.form.id,
        );

        if (!editedOrder) return;

        const variables = {
          id: this.form.id,
          updateOrder: {
            isPaid: Boolean(editedOrder.isPaid),
            status: editedOrder.status,
          },
        };

        const res = await graphqlRequest<
          UpdateOrderMutation,
          UpdateOrderMutationVariables
        >(UpdateOrderDocument, variables, {
          auth: true,
        });

        if (res.data) {
          notyNotification('Update success', 'success');
          this.form.id = null;
        } else {
          throw new Error(res.error.message);
        }
      } catch {
        notyNotification('Update failed', 'error');
      }
    },
    init() {
      this.fetchPage(this.currentPage);
    },
  };
}
