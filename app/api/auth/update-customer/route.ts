import { shopifyFetch } from '@/lib/shopify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const customerUpdateMutation = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id }
      customerUserErrors { message }
    }
  }
`;

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const customerAccessToken = cookieStore.get('customerAccessToken')?.value;
  const { firstName, lastName, password } = await req.json();

  if (!customerAccessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await shopifyFetch<any>({
      query: customerUpdateMutation,
      variables: {
        customerAccessToken,
        customer: { firstName, lastName, password }
      }
    });

    const { customerUserErrors } = response.body.customerUpdate;

    if (customerUserErrors.length > 0) {
      return NextResponse.json({ message: customerUserErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}