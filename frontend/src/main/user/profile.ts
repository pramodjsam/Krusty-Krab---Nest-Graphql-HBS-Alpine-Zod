import {
  CurrentUserDocument,
  CurrentUserQuery,
  CurrentUserQueryVariables,
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '@/generated/graphql';
import { graphqlRequest } from '@/shared/graphqlClient';
import { notyNotification } from '@/shared/notification';
import { updateProfileSchema } from '@/types';

type ProfilePage = {
  loading: boolean;
  form: {
    id: number;
    name: string;
    email: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
  };
  errors: Record<string, string>;
  fetchUser(): Promise<void>;
  updateUser(): Promise<void>;
  init(): Promise<void>;
};

export function profilePage(): ProfilePage {
  return {
    loading: false,
    form: {
      id: 0,
      name: '',
      email: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
    },
    errors: {
      name: '',
      email: '',
      address: '',
      city: '',
      province: '',
      zipCode: '',
    },
    async fetchUser() {
      this.loading = true;

      try {
        const result = await graphqlRequest<
          CurrentUserQuery,
          CurrentUserQueryVariables
        >(CurrentUserDocument, {});

        if (result.data) {
          Object.assign(this.form, result.data.user);
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async updateUser() {
      const result = updateProfileSchema.safeParse(this.form);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;

          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        });

        this.errors = fieldErrors;
        console.log('error', this.errors, this.form);
        notyNotification('Please fix the errors', 'error');
        return;
      }

      this.loading = true;

      try {
        const variables = {
          id: this.form.id,
          updateUser: {
            name: this.form.name,
            address: this.form.address,
            city: this.form.city,
            province: this.form.province,
            zipCode: this.form.zipCode,
          },
        };

        const result = await graphqlRequest<
          UpdateUserMutation,
          UpdateUserMutationVariables
        >(UpdateUserDocument, variables);

        if (result.data) {
          notyNotification('User update successfully', 'success');
        } else {
          throw new Error(result.error.message);
        }
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async init() {
      await this.fetchUser();
    },
  };
}
