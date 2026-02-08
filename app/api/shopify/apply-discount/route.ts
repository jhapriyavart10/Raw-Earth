import { shopifyFetch } from '@/lib/shopify';
import { NextResponse } from 'next/server';

const CART_DISCOUNT_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
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
        discountCodes {
          code
          applicable
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { checkoutId, discountCode } = await req.json();

    const response = await shopifyFetch<any>({
      query: CART_DISCOUNT_MUTATION,
      variables: { 
        cartId: checkoutId, 
        discountCodes: [discountCode] 
      },
      cache: 'no-store'
    });

    const mutationResult = response.body.cartDiscountCodesUpdate;
    
    if (mutationResult.userErrors?.length > 0) {
      return NextResponse.json({ success: false, error: mutationResult.userErrors[0].message });
    }

    const cart = mutationResult.cart;
    
    // Check if the code was actually valid/applicable
    const appliedCode = cart.discountCodes?.find((d: any) => d.code.toUpperCase() === discountCode.toUpperCase());
    
    if (!appliedCode || !appliedCode.applicable) {
      return NextResponse.json({ success: false, error: 'This discount code is not applicable to your cart.' });
    }

    // Return the FULL cart so Context can update everything (items, total, discount)
    return NextResponse.json({ 
      success: true, 
      cart: cart 
    });

  } catch (error: any) {
    console.error("Cart Discount API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to apply coupon' }, { status: 500 });
  }
}