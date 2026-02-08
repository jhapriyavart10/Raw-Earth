import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();
    
    // 1. Get Env Vars
    const listId = process.env.KLAVIYO_NEWSLETTER_LIST_ID;
    const privateKey = process.env.KLAVIYO_PRIVATE_KEY;

    if (!listId || !privateKey) {
      console.error("❌ Missing Klaviyo Credentials");
      return NextResponse.json(
        { error: 'Server configuration error: Missing Klaviyo credentials.' },
        { status: 500 }
      );
    }

    const payload = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [{
              type: 'profile',
              attributes: {
                email: email,
                subscriptions: {
                  email: { marketing: { consent: 'SUBSCRIBED' } }
                }
              }
            }]
          }
        },
        relationships: {
          list: { data: { type: 'list', id: listId } }
        }
      }
    };

    // 4. Send to Klaviyo
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${privateKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Revision': '2024-10-15'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Klaviyo API Error:", JSON.stringify(errorData, null, 2));
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Internal Subscribe Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}