import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify'; 

/* -------------------------------------------------------------------------- */
/* MUTATIONS                                 */
/* -------------------------------------------------------------------------- */

// 1. Update Identity & Address to get Shipping Rates
// FIXED: Removed (first: 10) from deliveryOptions and removed edges/node structure for it
const cartBuyerIdentityUpdateMutation = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        checkoutUrl
        deliveryGroups(first: 1) {
          edges {
            node {
              id
              deliveryOptions {
                handle
                title
                estimatedCost {
                  amount
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// 2. Select the Specific Delivery Option (Standard vs Express)
const cartSelectedDeliveryOptionsUpdateMutation = `
  mutation cartSelectedDeliveryOptionsUpdate($cartId: ID!, $selectedDeliveryOptions: [CartSelectedDeliveryOptionInput!]!) {
    cartSelectedDeliveryOptionsUpdate(cartId: $cartId, selectedDeliveryOptions: $selectedDeliveryOptions) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/* -------------------------------------------------------------------------- */
/* HELPER                                   */
/* -------------------------------------------------------------------------- */

const getCountryCode = (countryName: string) => {
  const map: Record<string, string> = {
    "Australia": "AU",
    "United States": "US",
    "United Kingdom": "GB",
    "New Zealand": "NZ",
    "Canada": "CA"
  };
  return map[countryName] || "AU"; 
};

export async function POST(req: Request) {
  try {
    const { cartId, variantId, quantity, customerDetails, shippingMethod } = await req.json();

    // -------------------------------------------------------
    // SCENARIO A: "Buy with Shop" / Instant Cart Creation
    // -------------------------------------------------------
    if (!cartId && variantId) {
      const createCartMutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart { id, checkoutUrl }
            userErrors { message }
          }
        }
      `;
      const response: any = await shopifyFetch({
        query: createCartMutation,
        variables: { input: { lines: [{ merchandiseId: variantId, quantity: quantity || 1 }] } },
        cache: 'no-store'
      });
      
      const cart = response.body?.cartCreate?.cart;
      if (cart) return NextResponse.json({ url: cart.checkoutUrl });
      return NextResponse.json({ error: "Could not create cart" }, { status: 400 });
    }

    if (cartId && customerDetails) {
      
      const deliveryAddress = {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        address1: customerDetails.streetAddress,
        address2: customerDetails.apartment || "",
        city: customerDetails.townCity,
        province: customerDetails.state,
        country: getCountryCode(customerDetails.country),
        zip: customerDetails.pincode,
        phone: customerDetails.phone
      };

      const buyerIdentity = {
        email: customerDetails.email,
        countryCode: getCountryCode(customerDetails.country),
        deliveryAddressPreferences: [
          {
            deliveryAddress: deliveryAddress
          }
        ]
      };

      const updateRes: any = await shopifyFetch({
        query: cartBuyerIdentityUpdateMutation,
        variables: { cartId, buyerIdentity },
        cache: 'no-store'
      });

      const updatedCartData = updateRes.body?.cartBuyerIdentityUpdate;
      
      if (updatedCartData?.userErrors?.length > 0) {
         console.warn("Buyer Identity Update Errors:", updatedCartData.userErrors);
      }

      const deliveryGroup = updatedCartData?.cart?.deliveryGroups?.edges?.[0]?.node;
      
      if (shippingMethod && deliveryGroup && deliveryGroup.deliveryOptions) {
        const availableOptions = deliveryGroup.deliveryOptions;
        
        let selectedHandle = null;

        if (shippingMethod === 'express') {
          const expressOption = availableOptions.find((opt: any) => 
            opt.title.toLowerCase().includes('express')
          );
          selectedHandle = expressOption?.handle;
        } else {
           const standardOption = availableOptions.find((opt: any) => 
            opt.title.toLowerCase().includes('standard')
          );
          selectedHandle = standardOption?.handle;
        }

        // Fallback logic
        if (!selectedHandle && availableOptions.length > 0) {
           const sortedOptions = [...availableOptions].sort((a: any, b: any) => parseFloat(a.estimatedCost.amount) - parseFloat(b.estimatedCost.amount));
           if (shippingMethod === 'express') {
             selectedHandle = sortedOptions[sortedOptions.length - 1].handle;
           } else {
             selectedHandle = sortedOptions[0].handle;
           }
        }

        if (selectedHandle) {
          const selectionRes: any = await shopifyFetch({
            query: cartSelectedDeliveryOptionsUpdateMutation,
            variables: {
              cartId,
              selectedDeliveryOptions: [{
                deliveryGroupId: deliveryGroup.id,
                deliveryOptionHandle: selectedHandle
              }]
            },
            cache: 'no-store'
          });

          const finalCart = selectionRes.body?.cartSelectedDeliveryOptionsUpdate?.cart;
          if (finalCart?.checkoutUrl) {
            return NextResponse.json({ url: finalCart.checkoutUrl });
          }
        }
      }

      if (updatedCartData?.cart?.checkoutUrl) {
        return NextResponse.json({ url: updatedCartData.cart.checkoutUrl });
      }
    }

    const cartQuery = `
      query getCart($id: ID!) {
        cart(id: $id) { checkoutUrl }
      }
    `;
    const data: any = await shopifyFetch({ query: cartQuery, variables: { id: cartId }, cache: 'no-store' });
    const cart = data?.body?.cart;
    
    if (!cart) {
      return NextResponse.json({ 
        error: 'STALE_ID', 
        message: 'Your session has expired. Please refresh the page.' 
      }, { status: 404 });
    }

    return NextResponse.json({ url: cart.checkoutUrl });

  } catch (error: any) {
    console.error('Checkout Error:', error.error?.message || error.message || error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}