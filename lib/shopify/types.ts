export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  productType: string;
  descriptionHtml: string;
  images: {
    edges: Array<{ node: { url: string } }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        quantityAvailable?: number;
        image?: { url: string };
        selectedOptions?: Array<{ name: string; value: string }>;
      };
    }>;
  };
  // Metafields often come in nested in raw Shopify responses
  gender?: any; 
  material?: any;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalTaxAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: { title: string };
          image?: { url: string; altText: string };
          price: { amount: string; currencyCode: string };
        };
      };
    }>;
  };
};

// --- ADDED THIS EXPORT ---
export type Product = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml?: string;
  price: number;
  image: string;
  images?: string[]; // Optional: if you want array of strings
  category: string;
  gender: string[];
  material: string[];
  // Optional extra fields based on your app usage
  careInstructions?: string;
  productDetails?: string;
  howToUse?: string;
  variants?: any[];
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Connection<T> = {
  edges: Array<{ node: T }>;
  pageInfo?: PageInfo;
};