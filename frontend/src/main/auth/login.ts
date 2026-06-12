import {
  SignInDocument,
  SignInMutation,
  SignInMutationVariables,
  SyncCartDocument,
  SyncCartMutation,
  SyncCartMutationVariables,
} from '@/generated/graphql';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import { loginSchema } from '@/types';
import Alpine from 'alpinejs';

type LoginPage = {
  loading: boolean;
  form: {
    email: string;
    password: string;
  };
  errors: Record<string, string>;
  login(email: string, password: string): Promise<void>;
  syncCart(): Promise<void>;
};

export function loginPage(): LoginPage {
  return {
    loading: false,
    form: {
      email: '',
      password: '',
    },
    errors: {},
    async login() {
      const result = loginSchema.safeParse(this.form);

      if (result.error) {
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

      this.loading = true;
      const variables = {
        signIn: {
          email: this.form.email,
          password: this.form.password,
        },
      };

      try {
        const res = await graphqlRequest<
          SignInMutation,
          SignInMutationVariables
        >(SignInDocument, variables, { auth: true });

        if (res.data) {
          const user = res.data.auth;
          Alpine.store('user').add(user);

          this.syncCart();

          notyNotification('Login successful', 'success');
          window.location.href = '/';
        } else {
          throw new Error(res.error.message);
        }
      } catch {
        notyNotification('Login failed', 'error');
      } finally {
        this.loading = false;
      }
    },
    async syncCart() {
      const localCartItems = Alpine.store('cart').items;

      const variables = {
        syncCartInput: {
          items: localCartItems.map((item) => ({
            productId: Number(item.productId),
            quantity: item.quantity,
          })),
        },
      };
      const syncResult = await graphqlRequest<
        SyncCartMutation,
        SyncCartMutationVariables
      >(SyncCartDocument, variables, { auth: true });

      if (syncResult.data) {
        Alpine.store('cart').items = syncResult.data.cart.cartItem.map(
          (item) => ({
            quantity: item.quantity,
            productId: item.productId,
          }),
        );
      }
    },
  };
}
