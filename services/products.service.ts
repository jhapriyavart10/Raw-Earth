import { shopifyFetch } from '@/lib/shopify';
import { getProductQuery, getProductsQuery } from '@/lib/shopify/queries';

function resolveMetaobjectLabels(metafield: any, fallback: string): string[] {
  if (metafield?.references?.edges) {
    const labels = metafield.references.edges.map(
      (edge: any) => edge.node.field?.value || fallback
    );
    return Array.from(new Set(labels));
  }

  if (metafield?.reference?.fields) {
    const displayField = metafield.reference.fields.find(
      (f: any) => f.key === 'label' || f.key === 'name' || f.key === 'value'
    );
    return [displayField?.value || fallback];
  }

  return [fallback];
}

export async function getProducts(query?: string) {
  try {
    // Construct the search query for Shopify
    // If 'query' is provided, search by title.
    const shopifyQuery = query ? `title:*${query}*` : undefined;

    const res = await shopifyFetch<any>({
      query: getProductsQuery,
      variables: { 
        first: 240, // FETCH MAX ITEMS to allow global filtering
        query: shopifyQuery 
      }, 
    });

    const edges = res?.body?.products?.edges;
    if (!edges) return [];

    return edges.map((edge: any) => {
      const product = edge.node;
      const variantNode = product.variants?.edges?.[0]?.node;
      const imageNode = product.images?.edges?.[0]?.node;

      return {
        id: variantNode?.id || product.id,
        productId: product.id,
        title: product.title,
        handle: product.handle,
        price: Number(variantNode?.price?.amount || 0),
        image: imageNode?.url || '/assets/images/necklace-img.png',
        category: product.productType || 'Jewellery',
        gender: resolveMetaobjectLabels(product.gender, 'Unisex'),
        material: resolveMetaobjectLabels(product.material, 'Uncategorized'),
      };
    });
  } catch (err) {
    console.error('Service Layer Failure (getProducts):', err);
    return [];
  }
}

export async function getProduct(handle: string) {
  try {
    const res = await shopifyFetch<any>({
      query: getProductQuery,
      variables: { handle },
      cache: 'no-store'
    });

    const product = res?.body?.product;
    if (!product) return null;

    const variantNode = product.variants?.edges?.[0]?.node;

    return {
      id: variantNode?.id || product.id,
      productId: product.id,
      title: product.title,
      handle: product.handle,
      price: Number(variantNode?.price?.amount || 0),
      image: product.images?.edges?.[0]?.node?.url || '/assets/images/necklace-img.png',
      description: product.descriptionHtml,
      
      howToUse: product.howToUse?.value || null,
      productDetails: product.productDetails?.value || null,
      careInstructions: product.careInstructions?.value || null,

      category: product.productType || 'Jewellery',
      gender: resolveMetaobjectLabels(product.gender, 'Unisex'),
      material: resolveMetaobjectLabels(product.material, 'Uncategorized'),
      
      variants: product.variants?.edges?.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: Number(v.node.price.amount),
        quantityAvailable: v.node.quantityAvailable,
        image: v.node.image?.url || null, 
        selectedOptions: v.node.selectedOptions.reduce((acc: any, opt: any) => {
          acc[opt.name] = opt.value;
          return acc;
        }, {})
      })) || [],
      rating: product.rating?.value ? parseFloat(product.rating.value) : 0,
      reviewCount: product.reviewCount?.value ? parseInt(product.reviewCount.value) : 0,
      reviews: product.reviewList?.value ? JSON.parse(product.reviewList.value) : []
    };
  } catch (err) {
    console.error('Fetch Product Error (getProduct):', err);
    return null;
  }
}