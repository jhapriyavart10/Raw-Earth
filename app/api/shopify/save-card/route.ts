import { shopifyFetch, updateCustomer } from '@/lib/shopify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const getExistingCardsQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      cards: metafield(namespace: "custom", key: "saved_card") {
        value
      }
    }
  }
`;

export async function POST(req: Request) {
  try {
    const { last4, brand, expiry } = await req.json();
    const accessToken = (await cookies()).get('customerAccessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingData = await shopifyFetch<any>({
      query: getExistingCardsQuery,
      variables: { customerAccessToken: accessToken },
      cache: 'no-store'
    });

    let currentCards: any[] = [];
    const existingValue = existingData.body?.customer?.cards?.value;
    
    if (existingValue) {
      try {
        currentCards = JSON.parse(existingValue);
        if (!Array.isArray(currentCards)) currentCards = [];
      } catch (e) {
        currentCards = [];
      }
    }

    const newCard = {
      id: Date.now(),
      cardNumber: `************${last4}`, // Store in format expected by UI
      brand,
      expiry
    };

    // 3. Append to list
    const updatedCards = [...currentCards, newCard];

    // 4. Save back to Shopify
    await updateCustomer(accessToken, {
      metafields: [
        {
          namespace: "custom",
          key: "saved_card",
          value: JSON.stringify(updatedCards),
          type: "json"
        }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Card Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
