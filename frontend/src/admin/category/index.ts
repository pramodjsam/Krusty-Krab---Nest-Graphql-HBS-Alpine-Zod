import { graphqlRequest } from '../../shared/graphqlClient';

export function categoryAdminPage() {
  return {
    categories: [],
    currentPage: 1,
    totalPages: 1,
    selectedId: null as number | null,
    async fetchPage(page = 1) {
      this.currentPage = page;
      const query = `
        query getCategories($page: Int!) {
            categories:getCategories(page: $page) {
                data {
                    id
                    name
                }
                pagination {
                    itemsPerPage
                    totalItems
                    currentPage
                    totalPages
                }
            }
        }
    `;
      const variables = { page };
      const result = await graphqlRequest(query, variables);

      const data = result.categories;
      this.categories = data.data;
      this.totalPages = data.pagination.totalPages;
    },

    goToPage(page: number) {
      if (page < 1 || page > this.totalPages) return;
      this.fetchPage(page);
    },
    confirmDelete() {
      alert(`Delete Category: ${this.selectedId}`);

      this.selectedId = null;
    },
    openDeleteModal(id: number) {
      this.selectedId = id;
    },
    visiblePages() {
      const pages: {
        number: number | null;
        text: string;
        key: string;
        isEllipsis: boolean;
      }[] = [];
      const delta = 2; // number of pages around current
      let l;

      for (let i = 1; i <= this.totalPages; i++) {
        if (
          i === 1 ||
          i === this.totalPages ||
          (i >= this.currentPage - delta && i <= this.currentPage + delta)
        ) {
          pages.push({
            number: i,
            text: i.toString(),
            key: i.toString(),
            isEllipsis: false,
          });
          l = i;
        } else if (l && i > l + 1) {
          pages.push({
            number: null,
            text: '...',
            key: `ellipsis-${i}`,
            isEllipsis: true,
          });
          l = i;
        }
      }

      return pages;
    },
    init() {
      this.fetchPage(this.currentPage);
    },
  };
}
