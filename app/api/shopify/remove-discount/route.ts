import { shopifyFetch } from '@/lib/shopify';
import { NextResponse } from 'next/server';

const REMOVE_DISCOUNT_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
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
    const { cartId } = await req.json();

    // Sending an empty array [] removes all discount codes
    const response = await shopifyFetch<any>({
      query: REMOVE_DISCOUNT_MUTATION,
      variables: { 
        cartId: cartId, 
        discountCodes: [] 
      },
      cache: 'no-store'
    });

    const mutationResult = response.body.cartDiscountCodesUpdate;
    
    if (mutationResult.userErrors?.length > 0) {
      return NextResponse.json({ success: false, error: mutationResult.userErrors[0].message });
    }

    return NextResponse.json({ 
      success: true, 
      cart: mutationResult.cart 
    });

  } catch (error: any) {
    console.error("Remove Discount API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to remove coupon' }, { status: 500 });
  }
}