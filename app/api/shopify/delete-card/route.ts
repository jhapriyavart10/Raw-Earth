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
    const { cardId } = await req.json();
    const accessToken = (await cookies()).get('customerAccessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch existing cards
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

    // 2. Filter out the card to be deleted
    const updatedCards = currentCards.filter((card: any) => card.id !== cardId);

    // 3. Save the updated list back to Shopify
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

    return NextResponse.json({ success: true, cards: updatedCards });
  } catch (error: any) {
    console.error("Delete Card Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
