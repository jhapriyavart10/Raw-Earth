import { NextResponse } from 'next/server';
import { CartService } from '@/services/cart.service';
import { shopifyFetch } from '@/lib/shopify'; 

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cartId = searchParams.get('id');

  if (!cartId) {
    return NextResponse.json({ error: 'Missing Cart ID' }, { status: 400 });
  }

  // Robust Query: Includes 'subtotalAmount' and 'discountCodes'
  const cartQuery = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }  
          totalTaxAmount { amount currencyCode }
        }
        discountCodes {
          code
          applicable
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
                  price { amount currencyCode }
                  product { title }
                  image { url }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await shopifyFetch<any>({
      query: cartQuery,
      variables: { cartId },
      cache: 'no-store'
    });

    const cart = response.body?.cart;

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Cart Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { cartId, variantId, quantity } = await req.json();
    
    if (!variantId) {
      return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 });
    }

    if (!cartId) {
      const newCart = await CartService.createCart(variantId, quantity || 1);
      return NextResponse.json(newCart);
    }

    const updatedCart = await CartService.addToCart(cartId, variantId, quantity || 1);
    return NextResponse.json(updatedCart);

  } catch (error) {
    console.error("Shopify Cart API Error:", error);
    return NextResponse.json({ error: 'Cart operation failed' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { cartId, lineId, quantity } = await req.json();
    
    if (!cartId || !lineId) {
      return NextResponse.json({ error: 'Missing cartId or lineId' }, { status: 400 });
    }

    const updatedCart = await CartService.updateLine(cartId, lineId, quantity);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Cart Update Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { cartId, lineIds } = await req.json();

    if (!cartId || !lineIds) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const updatedCart = await CartService.removeLine(cartId, lineIds);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("Cart Delete Error:", error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}