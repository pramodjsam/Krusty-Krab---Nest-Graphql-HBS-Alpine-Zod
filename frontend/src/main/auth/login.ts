import {
  SignInDocument,
  SignInMutation,
  SignInMutationVariables,
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
  };
}
