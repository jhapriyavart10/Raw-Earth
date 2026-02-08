// app/api/auth/recover/route.ts
import { recoverCustomerAccount } from '@/lib/shopify';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const response = await recoverCustomerAccount(email);
    const errors = (response.body as any)?.customerRecover?.customerUserErrors;

    if (errors && errors.length > 0) {
      return NextResponse.json({ message: errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recover API Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}