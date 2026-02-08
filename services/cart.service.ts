// services/cart.service.ts
import { shopifyFetch } from '@/lib/shopify';

const CartFragment = `
  id
  checkoutUrl
  cost {
    subtotalAmount { amount currencyCode }
    totalTaxAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url altText }
            price { amount currencyCode }
            product { title }
          }
        }
      }
    }
  }
  discountCodes {
    code
  }
`;

export const CartService = {
  async getCart(cartId: string) {
    const query = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          ${CartFragment}
        }
      }
    `;
    
    const res = await shopifyFetch<any>({
      query,
      variables: { cartId },
      cache: 'no-store'
    });

    return res.body?.cart;
  },

  async createCart(variantId: string, quantity: number) {
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            ${CartFragment}
          }
        }
      }
    `;
    const variables = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity
          }
        ]
      }
    };

    const res = await shopifyFetch<any>({ 
      query: mutation, 
      variables, 
      cache: 'no-store' 
    });
    
    return res.body?.cartCreate?.cart;
  },

  async addToCart(cartId: string, variantId: string, quantity: number = 1) {
    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ${CartFragment}
          }
        }
      }
    `;
    const variables = { 
      cartId, 
      lines: [{ merchandiseId: variantId, quantity: quantity }] 
    };

    const res = await shopifyFetch<any>({ 
      query: mutation, 
      variables, 
      cache: 'no-store' 
    });

    return res.body?.cartLinesAdd?.cart;
  },

  async updateLine(cartId: string, lineId: string, quantity: number) {
    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${CartFragment}
          }
        }
      }
    `;
    const variables = {
      cartId,
      lines: [{ id: lineId, quantity }]
    };

    const res = await shopifyFetch<any>({
      query: mutation,
      variables,
      cache: 'no-store'
    });

    return res.body?.cartLinesUpdate?.cart;
  },

  async removeLine(cartId: string, lineIds: string[]) {
    const mutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ${CartFragment}
          }
        }
      }
    `;
    
    const res = await shopifyFetch<any>({
      query: mutation,
      variables: { cartId, lineIds },
      cache: 'no-store'
    });

    return res.body?.cartLinesRemove?.cart;
  }
};