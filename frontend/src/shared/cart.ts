import {
  CreateCartDocument,
  CreateCartMutation,
  CreateCartMutationVariables,
  DecrementUserCartItemDocument,
  DecrementUserCartItemMutation,
  DecrementUserCartItemMutationVariables,
  IncrementUserCartItemDocument,
  IncrementUserCartItemMutation,
  IncrementUserCartItemMutationVariables,
  Product,
  RemoveUserCartDocument,
  RemoveUserCartMutation,
  RemoveUserCartMutationVariables,
} from '@/generated/graphql';
import Alpine from 'alpinejs';
import { graphqlRequest } from './graphqlClient';
import { notyNotification } from './notification';

export async function addToCart(product: Product) {
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
}

export async function increaseCartQuantity(product: Product) {
  const cartStore = Alpine.store('cart');
  const currentQty = cartStore.get(product.id)?.quantity ?? 0;

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
}

export async function decreaseCartQuantity(product: Product) {
  const cartStore = Alpine.store('cart');
  const currentQty = cartStore.get(product.id)?.quantity ?? 0;

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
}

export async function removeFromCart(product: Product) {
  const cartStore = Alpine.store('cart');

  try {
    cartStore.remove(product);
    const variables = {
      productId: product.id,
    };

    const result = await graphqlRequest<
      RemoveUserCartMutation,
      RemoveUserCartMutationVariables
    >(RemoveUserCartDocument, variables);

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    cartStore.add(product);
  }
}

export function getCartItems() {
  const cartStore = Alpine.store('cart');

  return cartStore.items;
}
