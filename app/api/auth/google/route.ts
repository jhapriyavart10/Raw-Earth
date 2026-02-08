import { createCustomer, loginCustomer } from '@/lib/shopify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 1. Remove the Node.js crypto import
// import crypto from 'crypto'; 

export const runtime = 'edge';

async function getGoogleUser(code: string) {
  const rootUrl = 'https://oauth2.googleapis.com/token';
  
  const options = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: process.env.REDIRECT_URI || '',
    grant_type: 'authorization_code',
  };

  const res = await fetch(rootUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(options),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error('Google Token Exchange Error:', errorData);
    throw new Error('Failed to exchange Google auth code');
  }

  const { id_token, access_token } = await res.json();

  const userRes = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: { Authorization: `Bearer ${id_token}` },
    }
  );

  if (!userRes.ok) {
    throw new Error('Failed to fetch user profile from Google');
  }

  const profile = await userRes.json();

  return {
    email: profile.email,
    firstName: profile.given_name || 'Google', 
    lastName: profile.family_name || 'User',
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=no_code', req.url));
  }

  try {
    const googleUser = await getGoogleUser(code); 
    const secret = process.env.GOOGLE_CLIENT_SECRET || 'fallback-secret';
    
    // 2. REPLACEMENT: Generate HMAC SHA-256 using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(googleUser.email)
    );
    // Convert buffer to hex string
    const securePassword = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    // END REPLACEMENT

    try {
      await createCustomer({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: securePassword,
        acceptsMarketing: true
      });
    } catch (e) {
      console.log('User may already exist, attempting login...');
    }

    let loginResponse = await loginCustomer(googleUser.email, securePassword);
    
    const accessToken = (loginResponse.body as any)?.customerAccessTokenCreate?.customerAccessToken?.accessToken;

    if (accessToken) {
      const response = NextResponse.redirect(new URL('/product-analogue', req.url));

      response.cookies.set('customerAccessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax'
      });

      return response;
    }

    return NextResponse.redirect(new URL('/signin?error=google_account_exists_please_login_manually', req.url));

  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.redirect(new URL('/signup?error=server_error', req.url));
  }
}