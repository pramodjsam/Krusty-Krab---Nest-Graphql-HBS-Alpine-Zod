import Alpine from 'alpinejs';
import {
  Category,
  CreateCartDocument,
  CreateCartMutation,
  CreateCartMutationVariables,
  DecrementUserCartItemDocument,
  DecrementUserCartItemMutation,
  DecrementUserCartItemMutationVariables,
  GetCategoriesDocument,
  GetCategoriesQuery,
  GetCategoriesQueryVariables,
  GetProductsDocument,
  GetProductsQuery,
  GetProductsQueryVariables,
  Image,
  IncrementUserCartItemDocument,
  IncrementUserCartItemMutation,
  IncrementUserCartItemMutationVariables,
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
  cart: {
    quantity: number;
    productId: number;
  }[];
  $refs: HomePageFormRefs;
  fetchCategoriesAndProducts(): Promise<void>;
  fetchCategories(): Promise<void>;
  fetchProducts(): Promise<void>;
  fetchCurrentUser(): Promise<void>;
  handleCategorySelection(categoryId: number): Promise<void>;
  handleAddToCart(product: Product): Promise<void>;
  handleIncreaseQuantity(product: Product): Promise<void>;
  handleDecreaseQuantity(product: Product): Promise<void>;
  getProductQuantity(product: Product): number;
  handleRemoveFromCart(product: Product): Promise<void>;
  isItemExistInCart(product: Product): boolean;
  getCartCount(): number;
  logout(): Promise<void>;
  init(): Promise<void>;
};

// TODO: same function also added in header component.
// Running on other pages than home page
// Separate out header and home page function
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
    async handleAddToCart(product) {
      try {
        Alpine.store('cart').add(product);

        const variables = {
          createCart: {
            quantity: 1,
            productId: product.id,
          },
        };

        const result = await graphqlRequest<
          CreateCartMutation,
          CreateCartMutationVariables
        >(CreateCartDocument, variables);

        if (result.data) {
          notyNotification('Item added to cart', 'success');
        } else {
          throw new Error(result.error.message);
        }
      } catch (error) {
        Alpine.store('cart').remove(product);
        notyNotification('Failed to add item to cart', 'error');
      }
    },
    async handleIncreaseQuantity(product: Product) {
      const cartStore = Alpine.store('cart');
      const currentQty = this.getProductQuantity(product);

      if (currentQty >= 10) return;

      cartStore.update(product.id, currentQty + 1);

      try {
        const variables = {
          productId: product.id,
        };

        await graphqlRequest<
          IncrementUserCartItemMutation,
          IncrementUserCartItemMutationVariables
        >(IncrementUserCartItemDocument, variables);

        notyNotification('Item added to cart successfully', 'success');
      } catch {
        cartStore.update(product.id, currentQty);
        notyNotification('Failed to update cart', 'error');
      }
    },
    async handleDecreaseQuantity(product: Product) {
      const cartStore = Alpine.store('cart');
      const currentQty = this.getProductQuantity(product);

      if (currentQty > 1) {
        try {
          cartStore.update(product.id, currentQty - 1);

          const variables = {
            productId: product.id,
          };

          await graphqlRequest<
            DecrementUserCartItemMutation,
            DecrementUserCartItemMutationVariables
          >(DecrementUserCartItemDocument, variables);

          notyNotification('Cart update successfully', 'success');
        } catch (error) {
          cartStore.update(product.id, currentQty);
          notyNotification('Failed to update cart', 'error');
        }
      } else {
        try {
          cartStore.remove(product);

          const variables = {
            productId: product.id,
          };

          await graphqlRequest<
            DecrementUserCartItemMutation,
            DecrementUserCartItemMutationVariables
          >(DecrementUserCartItemDocument, variables);

          notyNotification('Cart update successfully', 'success');
        } catch (error) {
          cartStore.add(product);
          notyNotification('Failed to update cart', 'error');
        }
      }
    },
    getProductQuantity(product: Product) {
      const item = Alpine.store('cart').get(product.id);

      return item?.quantity || 0;
    },
    async handleRemoveFromCart(product) {
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

      await this.fetchCurrentUser();
    },
  };
}
