import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function POST() {
  (await cookies()).delete('customerAccessToken');
  return NextResponse.json({ success: true });
}