import {
  SignInDocument,
  SignInMutation,
  SignInMutationVariables,
} from '@/generated/graphql';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import Alpine from 'alpinejs';

type AuthPage = {
  loading: boolean;
  form: {
    email: string;
    password: string;
  };
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<void>;
};

export function authPage(): AuthPage {
  return {
    loading: false,
    form: {
      email: '',
      password: '',
    },
    async login() {
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
          Alpine.store('user').add(res.data.auth);
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
    async logout() {},
    async register(
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
    ) {},
  };
}
