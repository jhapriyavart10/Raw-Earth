import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const privateKey = process.env.KLAVIYO_PRIVATE_KEY;
    if (!privateKey) return NextResponse.json({ error: 'Private key missing' }, { status: 500 });

    /**
     * THE FIX: Triple-delimited Compound ID
     * Klaviyo Atlas often requires: $custom:::$default:::[ID]
     */
    const klaviyoItemId = `$custom:::$default:::${productId}`;
    
    const filter = `equals(item.id,'${klaviyoItemId}')`;
    const url = `https://a.klaviyo.com/api/reviews/?filter=${encodeURIComponent(filter)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${privateKey}`,
        'accept': 'application/json',
        'revision': '2024-10-15' 
      }
    });

    const data = await response.json();

    // FALLBACK: If the triple-delimited one fails, try the double-delimited one
    if (!response.ok || !data.data || data.data.length === 0) {
        // Some accounts use this instead
        const altId = `$default:::${productId}`;
        const altFilter = `equals(item.id,'${altId}')`;
        const altUrl = `https://a.klaviyo.com/api/reviews/?filter=${encodeURIComponent(altFilter)}`;
        
        const altRes = await fetch(altUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Klaviyo-API-Key ${privateKey}`,
              'revision': '2024-10-15'
            }
        });
        
        if (altRes.ok) {
            const altData = await altRes.json();
            if (altData.data?.length > 0) return formatResponse(altData.data);
        }
    }

    return formatResponse(data.data || []);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatResponse(items: any[]) {
  return NextResponse.json({ 
    reviews: items.map((item: any) => ({
      rating: item.attributes.rating,
      title: item.attributes.title,
      content: item.attributes.content,
      reviewer_name: item.attributes.author || 'Verified Buyer',
      created_at: item.attributes.created || item.attributes.created_at,
    }))
  });
}