import { NextResponse } from 'next/server';
import { getProducts, getProduct } from '@/services/products.service';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    // 1. Log that we started (check Cloudflare Real-time Logs for this)
    console.log("🟢 Debugger: Request started");

    // 2. Validate Environment Variables Manually
    // We check them here to see if Cloudflare is actually injecting them
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const version = process.env.SHOPIFY_API_VERSION;

    if (!domain) throw new Error("CRITICAL: SHOPIFY_STORE_DOMAIN is missing or undefined");
    if (!token) throw new Error("CRITICAL: SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing or undefined");
    
    // 3. Check for the "Invisible Space" Issue automatically
    if (domain.trim() !== domain) throw new Error(`CRITICAL: SHOPIFY_STORE_DOMAIN has hidden spaces! Value: '${domain}'`);
    if (token.trim() !== token) throw new Error(`CRITICAL: SHOPIFY_STOREFRONT_ACCESS_TOKEN has hidden spaces!`);

    // 4. Parse URL
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get('handle');
    const query = searchParams.get('q');

    // 5. Run the Logic
    if (handle) {
      const product = await getProduct(handle);
      if (!product) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      return NextResponse.json(product);
    }

    const products = await getProducts(query || undefined);
    
    // 6. Return Success
    return NextResponse.json(Array.isArray(products) ? products : []);

  } catch (error: any) {
    // 🛑 THIS STOPS THE 1101 CRASH 🛑
    // Instead of crashing, we return the specific error details as JSON.
    console.error("🔴 WORKER CRASHED:", error);
    
    return NextResponse.json({ 
      error_type: "Worker Crash Prevented",
      message: error.message || "Unknown Error",
      stack: error.stack,
      environment_debug: {
        has_domain: !!process.env.SHOPIFY_STORE_DOMAIN,
        has_token: !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        api_version: process.env.SHOPIFY_API_VERSION || "undefined"
      }
    }, { status: 500 });
  }
}