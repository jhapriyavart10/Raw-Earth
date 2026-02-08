import { customerRecoverMutation } from './mutations';

export async function shopifyFetch<T>({
  query,
  variables = {},
  cache = 'force-cache'
}: {
  query: string;
  variables?: any;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  const endpoint = process.env.SHOPIFY_STORE_DOMAIN!;
  const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

  let retries = 3;

  while (retries > 0) {
    try {
      const result = await fetch(`https://${endpoint}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': key
        },
        body: JSON.stringify({ query, variables }),
        cache
      });

      const body = await result.json();

      if (body.errors) {
        throw body.errors[0];
      }

      return {
        status: result.status,
        body: body.data
      };
    } catch (e: any) {
      retries--;
      console.error(`Shopify Fetch Error (Attempts remaining: ${retries}):`, e.message || e);
      
      if (retries === 0) {
        throw {
          error: e,
          query
        };
      }
      
      // Wait 1 second before retrying to let the network stabilize
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Shopify fetch failed after retries");
}

const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { message }
    }
  }
`;

const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { message }
    }
  }
`;

const customerUpdateMutation = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id }
      customerUserErrors { message }
    }
  }
`;

export async function createCustomer(details: any) {
  return shopifyFetch({
    query: customerCreateMutation,
    variables: { input: details },
    cache: 'no-store'
  });
}

export async function loginCustomer(email: string, password: string) {
  return shopifyFetch({
    query: customerAccessTokenCreateMutation,
    variables: { input: { email, password } },
    cache: 'no-store'
  });
}

export async function updateCustomer(accessToken: string, customerData: any) {
  return shopifyFetch<any>({
    query: customerUpdateMutation,
    variables: { 
      customerAccessToken: accessToken,
      customer: customerData 
    },
    cache: 'no-store'
  });
}

export async function recoverCustomerAccount(email: string) {
  return shopifyFetch({
    query: customerRecoverMutation,
    variables: { email },
    cache: 'no-store'
  });
}