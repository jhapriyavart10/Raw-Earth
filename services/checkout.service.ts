import { NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = '2024-01';

const SHOPIFY_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function shopifyFetch(query: string, variables: any) {
  const res = await fetch(SHOPIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

export async function POST(req: Request) {
  try {
    const { cartId } = await req.json();

    if (!cartId) {
      return NextResponse.json(
        { error: 'cartId is required' },
        { status: 400 }
      );
    }

    /* -----------------------------
       1. FETCH CART LINE ITEMS
    ------------------------------*/
    const cartQuery = `
      query getCart($id: ID!) {
        cart(id: $id) {
          lines(first: 50) {
            edges {
              node {
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    const cartData = await shopifyFetch(cartQuery, { id: cartId });

    const lines = cartData?.cart?.lines?.edges;

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty or invalid' },
        { status: 400 }
      );
    }

    const lineItems = lines.map((edge: any) => ({
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
    }));

    /* -----------------------------
       2. CREATE CHECKOUT
    ------------------------------*/
    const checkoutMutation = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            webUrl
          }
          checkoutUserErrors {
            message
          }
        }
      }
    `;

    const checkoutData = await shopifyFetch(checkoutMutation, {
      input: {
        lineItems,
      },
    });

    const checkout = checkoutData.checkoutCreate.checkout;
    const errors = checkoutData.checkoutCreate.checkoutUserErrors;

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }

    if (!checkout?.webUrl) {
      throw new Error('Checkout URL not returned by Shopify');
    }

    /* -----------------------------
       3. RETURN CHECKOUT URL
    ------------------------------*/
    return NextResponse.json({ url: checkout.webUrl });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
