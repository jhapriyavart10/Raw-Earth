import { customerRecoverMutation } from './mutations';

export async function shopifyFetch<T>({
  query,
  variables = {},
  cache = 'no-store' // <--- FIXED: Changed from 'force-cache' to 'no-store'
}: {
  query: string;
  variables?: any;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2025-10';

  // Debug check
  if (!domain || !token) {
    throw new Error("Missing Shopify Environment Variables in shopifyFetch");
  }

  // Ensure no "https://" in domain
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const endpoint = `https://${cleanDomain}/api/${version}/graphql.json`;

  let retries = 3;

  while (retries > 0) {
    try {
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token
        },
        body: JSON.stringify({ query, variables }),
        cache: cache === 'force-cache' ? 'no-store' : cache // Safety fallback: Cloudflare hates force-cache
      });

      if (!result.ok) {
        const text = await result.text();
        throw new Error(`Shopify API Error (${result.status}): ${text}`);
      }

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
      
      // Reduce wait time to prevent Cloudflare timeout
      await new Promise((resolve) => setTimeout(resolve, 500)); 
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