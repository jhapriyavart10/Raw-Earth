import { NextResponse } from 'next/server';
import { getProducts, getProduct } from '@/services/products.service';
export const runtime = 'edge';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');
  const query = searchParams.get('q'); // Read search query

  try {
    if (handle) {
      const product = await getProduct(handle);
      if (!product) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      return NextResponse.json(product);
    }

    // Pass the query to the service
    // If query is null/empty, getProducts will return all items (up to 240)
    const products = await getProducts(query || undefined);
    
    return NextResponse.json(Array.isArray(products) ? products : []);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}