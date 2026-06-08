import {
  GetUsersDocument,
  GetUsersQuery,
  GetUsersQueryVariables,
  Role,
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  User,
} from '../../generated/graphql';
import { formatToIntlDate, paginationPages } from '../../shared/common';
import { graphqlRequest } from '../../shared/graphqlClient';
import { notyNotification } from '../../shared/notification';

type UserAdminPage = {
  users: Partial<User>[];
  form: {
    id: number | null;
  };
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
  startEdit: (user: Partial<User>) => void;
  saveEdit: () => Promise<void>;
  init: () => void;
};

export function userAdminPage(): UserAdminPage {
  return {
    users: [],
    form: {
      id: null,
    },
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
          GetUsersQuery,
          GetUsersQueryVariables
        >(GetUsersDocument, variables);

        if (result.data) {
          const data = result.data.users;
          this.users = data.data.map((user) => {
            return {
              ...user,
              createdAt: formatToIntlDate(String(user.createdAt)),
            };
          });
          this.totalPages = data.pagination.totalPages;
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
    startEdit(user: Partial<User>) {
      if (user.id) {
        this.form.id = user.id;
      }
    },
    async saveEdit() {
      if (!this.form.id) return;

      try {
        const editedUser = this.users.find((user) => user.id === this.form.id);

        if (!editedUser) return;

        const variables = {
          id: this.form.id,
          updateUser: {
            role: editedUser.role as Role,
          },
        };

        const res = await graphqlRequest<
          UpdateUserMutation,
          UpdateUserMutationVariables
        >(UpdateUserDocument, variables);

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
