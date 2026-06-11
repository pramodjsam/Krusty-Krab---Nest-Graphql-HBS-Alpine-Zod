import {
  SignUpDocument,
  SignUpMutation,
  SignUpMutationVariables,
} from '@/generated/graphql';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import { registerSchema } from '@/types';

type RegisterPage = {
  loading: boolean;
  form: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    password: string;
    confirmPassword: string;
  };
  errors: Record<string, string>;
  register(): Promise<void>;
};

export function registerPage(): RegisterPage {
  return {
    loading: false,
    form: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
      password: '',
      confirmPassword: '',
    },
    errors: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
      password: '',
      confirmPassword: '',
    },
    async register() {
      // Validate
      const result = registerSchema.safeParse(this.form);

      if (!result.success) {
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
        signUp: {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          address: this.form.address,
          city: this.form.city,
          province: this.form.province,
          zipCode: this.form.zipCode,
          password: this.form.password,
        },
      };

      try {
        const result = await graphqlRequest<
          SignUpMutation,
          SignUpMutationVariables
        >(SignUpDocument, variables);
        if (result.data) {
          notyNotification('Registered successfully', 'success');
          window.location.href = '/';
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Failed to register user', 'error');
      } finally {
        this.loading = false;
      }
    },
  };
}
