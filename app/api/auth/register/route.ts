import { createCustomer } from '@/lib/shopify';
import { NextResponse } from 'next/server';
import { z } from 'zod';
export const runtime = 'edge';

// 1. Define the Validation Schema
const RegisterSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  phone: z.string().optional().or(z.literal('')) // FIXED: Allow phone number
});

interface CustomerCreateData {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: Array<{ message: string }>;
  };
}

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    // 3. Validate input with Zod
    const validation = RegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: "Validation Error", 
          errors: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // 4. Extract validated data
    const { email, password, firstName, lastName, phone } = validation.data;

    // 5. Call Shopify API
    const response = await createCustomer({
      email,
      password,
      firstName,
      lastName,
      phone: phone === "" ? undefined : phone,// FIXED: Sending phone to Shopify
      acceptsMarketing: true
    });

    const responseBody = response.body as CustomerCreateData;
    
    if (!responseBody || !responseBody.customerCreate) {
      console.error('Unexpected Shopify structure or empty response:', responseBody);
      return NextResponse.json(
        { message: 'Invalid response from Shopify service' },
        { status: 500 }
      );
    }

    const { customer, customerUserErrors } = responseBody.customerCreate;

    if (customerUserErrors && customerUserErrors.length > 0) {
      return NextResponse.json(
        { message: customerUserErrors[0].message },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer creation succeeded but no data was returned.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      customerId: customer.id 
    });

  } catch (error: any) {
    console.error('Registration Route Exception:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}