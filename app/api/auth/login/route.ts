import { loginCustomer } from '@/lib/shopify';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface CustomerAccessTokenCreateData {
  customerAccessTokenCreate: {
    customerAccessToken: { accessToken: string; expiresAt: string } | null;
    customerUserErrors: Array<{ message: string }>;
  };
}

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json(); 

    const response = await loginCustomer(email, password);
    const responseBody = response.body as CustomerAccessTokenCreateData;

    if (!responseBody || !responseBody.customerAccessTokenCreate) {
      console.error('Unexpected Shopify login response structure:', responseBody);
      return NextResponse.json(
        { message: 'Invalid response from login service' },
        { status: 500 }
      );
    }

    const { customerAccessToken, customerUserErrors } = responseBody.customerAccessTokenCreate;

    if (customerUserErrors && customerUserErrors.length > 0) {
      return NextResponse.json(
        { message: customerUserErrors[0].message }, 
        { status: 401 }
      );
    }

    if (!customerAccessToken?.accessToken) {
      return NextResponse.json(
        { message: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined; 

    (await cookies()).set('customerAccessToken', customerAccessToken.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // FIXED: 'lax' ensures cookie sends on top-level navigations (e.g. from Google)
      maxAge: maxAge, // FIXED: Respect user choice
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Login Route Exception:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}