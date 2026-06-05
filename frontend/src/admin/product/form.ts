import {
  Category,
  CreateProductDocument,
  CreateProductMutation,
  GetCategoriesNameDocument,
  GetCategoriesNameQuery,
  GetCategoriesNameQueryVariables,
  GetProductDocument,
  GetProductQuery,
  GetProductQueryVariables,
  UpdateProductDocument,
  UpdateProductMutation,
} from '../../generated/graphql';
import { buildMultipartRequest, validateForm } from '../../shared/common';
import { graphqlRequest } from '../../shared/graphqlClient';
import { notyNotification } from '../../shared/notification';

interface ProductAdminFormRefs {
  imageInput: HTMLInputElement;
}

type ProductAdminFormPage = {
  form: {
    name: string;
    price: number;
    image: File | null;
    category: string;
  };
  categories: Partial<Category>[];
  errors: Record<string, string>;
  $refs: ProductAdminFormRefs;
  imagePreview: string;
  loading: boolean;
  productId?: number;
  isEdit: boolean;
  submit: () => Promise<void>;
  handleFileChange: (event: Event) => void;
  setDefaultImage: () => Promise<void>;
  handleFormImageClose: () => void;
  validate: () => boolean;
  getCategory: () => Promise<void>;
  getProduct: () => Promise<void>;
  init: () => void;
};

export function productAdminFormPage(productId?: number): ProductAdminFormPage {
  return {
    form: {
      name: '',
      price: 0,
      image: null,
      category: '',
    },
    categories: [],
    errors: {
      name: '',
      price: '',
      category: '',
    },
    $refs: {} as ProductAdminFormRefs,
    imagePreview: '',
    loading: false,
    productId: productId,
    isEdit: !!productId,

    async submit() {
      this.loading = true;

      try {
        if (!this.validate()) {
          return;
        }

        const isEdit = this.isEdit;
        const mutation = isEdit ? UpdateProductDocument : CreateProductDocument;
        const variables = isEdit
          ? {
              id: Number(this.productId),
              updateProduct: {
                name: this.form.name,
                price: Number(this.form.price),
                categoryId: Number(this.form.category),
              },
            }
          : {
              createProduct: {
                name: this.form.name,
                price: Number(this.form.price),
                categoryId: Number(this.form.category),
              },
            };

        let response: CreateProductMutation | UpdateProductMutation;

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

        if (!response?.product?.id) {
          throw new Error('Failed: Submit');
        }

        window.location.href = '/user/admin/product';
      } catch {
        notyNotification('Failed to create product', 'error');
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
      const [errors, valid] = validateForm(this.form, [
        'name',
        'price',
        'category',
      ]);
      this.errors = errors;

      if (!valid) {
        notyNotification('Please fix validation errors', 'error');
      }

      return valid;
    },
    async getCategory() {
      const variables = {
        page: 1,
        limit: 100,
      };
      try {
        this.loading = true;

        const result = await graphqlRequest<
          GetCategoriesNameQuery,
          GetCategoriesNameQueryVariables
        >(GetCategoriesNameDocument, variables);
        const data = result.categories;
        this.categories = data.data;
      } catch {
        notyNotification('Something went wrong', 'error');
      } finally {
        this.loading = false;
      }
    },
    async getProduct() {
      this.loading = true;

      try {
        const variables = {
          id: Number(this.productId),
        };
        const res = await graphqlRequest<
          GetProductQuery,
          GetProductQueryVariables
        >(GetProductDocument, variables);

        if (res.product) {
          this.form.name = res.product.name;
          this.form.price = res.product.price;
          this.form.category = String(res.product.category.id);
          this.imagePreview = res.product.image?.url || '/images/burger.png';
        } else {
          throw new Error('Failed to load product');
        }
      } catch {
        notyNotification('Failed to load category', 'error');
        window.location.href = '/user/admin/product';
      } finally {
        this.loading = false;
      }
    },
    async init() {
      await this.getCategory();

      if (this.isEdit && this.productId) {
        this.getProduct();
      } else {
        await this.setDefaultImage();
      }
    },
  };
}
