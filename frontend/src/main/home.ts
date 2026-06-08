import Alpine from 'alpinejs';
import {
  Category,
  GetCategoriesDocument,
  GetCategoriesQuery,
  GetCategoriesQueryVariables,
  GetProductsDocument,
  GetProductsQuery,
  GetProductsQueryVariables,
  Image,
  LogoutDocument,
  Product,
  User,
} from '../generated/graphql';
import { graphqlRequest } from '../shared/graphqlClient';
import { notyNotification } from '../shared/notification';

interface HomePageFormRefs {
  menuRight: HTMLDivElement;
}

type HomePage = {
  loading: boolean;
  user: Partial<User> | null;
  categories: (Omit<Partial<Category>, 'image'> & {
    image: Partial<Image> | null;
  })[];
  products: (Omit<Partial<Product>, 'category' | 'image'> & {
    category: Partial<Category> | null;
    image: Partial<Image> | null;
  })[];
  selectedCategory: number;
  filteredProducts: (Omit<Partial<Product>, 'category' | 'image'> & {
    category: Partial<Category> | null;
    image: Partial<Image> | null;
  })[];
  cart: (Partial<Product> & {
    quantity: number;
  })[];
  $refs: HomePageFormRefs;
  fetchCategoriesAndProducts(): Promise<void>;
  fetchCategories(): Promise<void>;
  fetchProducts(): Promise<void>;
  fetchCurrentUser(): Promise<void>;
  handleCategorySelection(categoryId: number): Promise<void>;
  handleAddToCart(product: Product): void;
  handleRemoveFromCart(product: Product): void;
  isItemExistInCart(product: Product): boolean;
  getCartCount(): number;
  logout(): Promise<void>;
  init(): Promise<void>;
};

export function homePage(): HomePage {
  return {
    loading: false,
    user: null,
    categories: [],
    products: [],
    selectedCategory: 0,
    filteredProducts: [],
    cart: [],
    $refs: {} as HomePageFormRefs,
    async fetchCategoriesAndProducts() {
      await this.fetchCategories();
      await this.fetchProducts();
    },
    async fetchCategories() {
      this.loading = true;
      const variables = {
        limit: 50,
        sort: [['id', 'ASC']],
      };
      try {
        const categoryRes = await graphqlRequest<
          GetCategoriesQuery,
          GetCategoriesQueryVariables
        >(GetCategoriesDocument, variables);

        const data = categoryRes.data?.categories;
        this.categories = data?.data || [];
      } catch (error) {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async fetchProducts() {
      this.loading = true;
      const variables = {
        limit: 300,
        sort: [['id', 'ASC']],
      };
      try {
        const productsRes = await graphqlRequest<
          GetProductsQuery,
          GetProductsQueryVariables
        >(GetProductsDocument, variables);

        const data = productsRes.data?.products;
        this.products = data?.data || [];
        this.filteredProducts = this.products;
      } catch (error) {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async fetchCurrentUser() {
      const user = Alpine.store('user').user;
      this.user = user;

      // this.loading = true;

      // try {
      //   const res = await graphqlRequest<
      //     CurrentUserQuery,
      //     CurrentUserQueryVariables
      //   >(CurrentUserDocument, {});

      //   if (res.data) {
      //     this.user = res.data?.user;
      //   } else {
      //   }
      // } catch (error) {
      //   notyNotification('Failed to fetch', 'error');
      // } finally {
      //   this.loading = false;
      // }
    },
    async handleCategorySelection(categoryId: number) {
      if (categoryId) {
        this.selectedCategory = categoryId;
        this.filteredProducts = this.products.filter(
          (product) => product.category?.id === categoryId,
        );
      } else {
        this.selectedCategory = 0;
        this.filteredProducts = this.products;
      }

      Alpine.nextTick(() => {
        const el = this.$refs.menuRight;
        if (!el) return;

        el.scrollTop = 0;
      });
    },
    handleAddToCart(product) {
      Alpine.store('cart').add(product);
    },
    handleRemoveFromCart(product) {
      Alpine.store('cart').remove(product);
    },
    isItemExistInCart(product: Product) {
      return Alpine.store('cart').exists(product);
    },
    getCartCount() {
      return Alpine.store('cart').count();
    },
    async logout() {
      this.loading = true;

      try {
        const res = await graphqlRequest(LogoutDocument, {});

        if (res.error) {
          notyNotification(res.error.message);
        }

        Alpine.store('user').clear();
        window.location.href = '/';
      } catch {
        notyNotification('Failed to logout', 'error');
      } finally {
        this.loading = false;
      }
    },
    async init() {
      await this.fetchCategoriesAndProducts();

      Alpine.nextTick(async () => {
        await this.fetchCurrentUser();
      });
    },
  };
}
