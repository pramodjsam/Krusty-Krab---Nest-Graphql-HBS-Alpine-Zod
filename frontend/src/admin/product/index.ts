import {
  Category,
  DeleteProductDocument,
  DeleteProductMutation,
  DeleteProductMutationVariables,
  GetProductsDocument,
  GetProductsQuery,
  GetProductsQueryVariables,
  Image,
  Product,
} from '../../generated/graphql';
import { paginationPages } from '../../shared/common';
import { graphqlRequest } from '../../shared/graphqlClient';
import { notyNotification } from '../../shared/notification';

type ProductAdminPage = {
  products: (Omit<Partial<Product>, 'image' | 'category'> & {
    image?: Partial<Image> | null;
    category?: Partial<Category> | null;
  })[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  selectedId: number | null;
  sortBy: string;
  sortOrder: 'DESC' | 'ASC';
  searchText: string;
  fetchPage(page?: number, limit?: number): Promise<void>;
  goToPage(page: number): void;
  confirmDelete(): Promise<void>;
  openDeleteModal(id: number): void;
  visiblePages(): {
    number: number | null;
    text: string;
    key: string;
    isEllipsis: boolean;
  }[];
  sort: (column: string) => void;
  handleSearchSubmit: () => void;
  clearSearch: () => void;
  init(): void;
};

export function productAdminPage(): ProductAdminPage {
  return {
    products: [],
    loading: false,
    currentPage: 1,
    totalPages: 1,
    selectedId: null,
    sortBy: 'id',
    sortOrder: 'DESC',
    searchText: '',
    async fetchPage(page = 1, limit = 5) {
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
          GetProductsQuery,
          GetProductsQueryVariables
        >(GetProductsDocument, variables);

        if (result.data) {
          const data = result.data.products;
          this.products = data.data;
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
    async confirmDelete() {
      if (!this.selectedId) return;

      this.loading = true;
      const variables = {
        id: this.selectedId,
      };

      try {
        const res = await graphqlRequest<
          DeleteProductMutation,
          DeleteProductMutationVariables
        >(DeleteProductDocument, variables);

        if (res.data) {
          this.selectedId = null;
          notyNotification('Product deleted successfully', 'success');
          await this.fetchPage(this.currentPage);

          document
            .querySelector<HTMLButtonElement>('#deleteModal .btn-close')
            ?.click();
        }
        if (res.error) {
          throw new Error(res.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    openDeleteModal(id: number) {
      this.selectedId = id;
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
    init() {
      this.fetchPage(this.currentPage);
    },
  };
}
