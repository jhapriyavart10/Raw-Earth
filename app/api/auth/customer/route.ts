import { shopifyFetch } from '@/lib/shopify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const getCustomerQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      firstName
      lastName
      email
      cards: metafield(namespace: "custom", key: "saved_card") {
        value
      }
    }
  }
`;

export async function GET() {
  const cookieStore = await cookies();
  const customerAccessToken = cookieStore.get('customerAccessToken')?.value;

  if (!customerAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await shopifyFetch<any>({
      query: getCustomerQuery,
      variables: { customerAccessToken },
      cache: 'no-store'
    });

    const customer = response.body?.customer;
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}