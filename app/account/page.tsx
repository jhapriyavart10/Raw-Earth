import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const customerToken = cookieStore.get('customerAccessToken')?.value;

  // If no token is found, redirect back to the sign-in page
  if (!customerToken) {
    redirect('/signin');
  }

  return (
    <>
      <Header />
      <div className="bg-[#F6D8AB] min-h-screen p-8 lg:pl-[72px]">
        <h1 className="font-lora text-4xl text-[#280F0B] mb-6">Account Dashboard</h1>
        {/* Your account content here */}
      </div>
    </>
  );
}