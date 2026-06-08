import {
  CreateCategoryDocument,
  GetCategoryDocument,
  GetCategoryQuery,
  GetCategoryQueryVariables,
  UpdateCategoryDocument,
} from '../../generated/graphql';
import { buildMultipartRequest, validateForm } from '../../shared/common';
import { graphqlRequest, GraphQLResult } from '../../shared/graphqlClient';
import { notyNotification } from '../../shared/notification';

interface CategoryAdminFormRefs {
  imageInput: HTMLInputElement;
}

type CategoryAdminFormPage = {
  form: {
    name: string;
    image: File | null;
  };
  errors: Record<string, string>;
  $refs: CategoryAdminFormRefs;
  imagePreview: string;
  loading: boolean;
  categoryId?: number;
  isEdit: boolean;
  submit: () => Promise<void>;
  handleFileChange: (event: Event) => void;
  setDefaultImage: () => Promise<void>;
  handleFormImageClose: () => void;
  validate: () => boolean;
  init: () => void;
};

export function categoryAdminFormPage(
  categoryId?: number,
): CategoryAdminFormPage {
  return {
    form: {
      name: '',
      image: null,
    },
    errors: {
      name: '',
    },
    $refs: {} as CategoryAdminFormRefs,
    imagePreview: '',
    loading: false,
    categoryId,
    isEdit: !!categoryId,

    async submit() {
      this.loading = true;

      try {
        if (!this.validate()) {
          return;
        }

        const isEdit = this.isEdit;
        const mutation = isEdit
          ? UpdateCategoryDocument
          : CreateCategoryDocument;
        const variables = isEdit
          ? {
              id: Number(this.categoryId),
              updateCategory: {
                name: this.form.name,
              },
            }
          : {
              createCategory: {
                name: this.form.name,
              },
            };
        let response: GraphQLResult<unknown>;

        if (this.form.image) {
          const formData = buildMultipartRequest(
            this.form.image,
            variables,
            mutation,
          );
          response = await graphqlRequest(mutation, formData);
        } else {
          response = await graphqlRequest(mutation, variables);
        }

        if (!isEdit && response.error) {
          throw new Error('Create failed');
        }

        window.location.href = '/user/admin/category';
      } catch {
        notyNotification('Failed to create category', 'error');
      } finally {
        this.loading = false;
      }
    },
    handleFileChange(event: Event) {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        this.form.image = input.files[0];
        this.imagePreview = URL.createObjectURL(input.files[0]);
      }
    },
    async setDefaultImage() {
      const url = '/images/burger.png';

      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'default.png', { type: blob.type });
      this.imagePreview = URL.createObjectURL(file);
    },
    handleFormImageClose() {
      this.form.image = null;
      this.$refs.imageInput.value = '';
      this.setDefaultImage();
    },
    validate() {
      const [errors, valid] = validateForm(this.form, ['name']);

      this.errors = errors;

      if (!valid) {
        notyNotification('Please fix validation errors', 'error');
      }

      return valid;
    },
    async init() {
      if (this.isEdit && this.categoryId) {
        this.loading = true;

        try {
          const variables = {
            id: Number(this.categoryId),
          };
          const res = await graphqlRequest<
            GetCategoryQuery,
            GetCategoryQueryVariables
          >(GetCategoryDocument, variables);

          if (res.data?.category) {
            this.form.name = res.data.category.name;
            this.imagePreview =
              res.data.category.image?.url || '/images/burger.png';
          } else {
            notyNotification('Category not found', 'error');
          }
        } catch (error) {
          notyNotification('Failed to load category', 'error');
        } finally {
          this.loading = false;
        }
      } else {
        await this.setDefaultImage();
      }
    },
  };
}
