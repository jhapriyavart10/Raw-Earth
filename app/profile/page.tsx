'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { AccountSection, SECTIONS } from '@/types/account';
import OrdersContent from '@/components/profile/OrdersContent';
import AccountDetails from '@/components/profile/AccountDetails';
import Addresses from '@/components/profile/Addresses';
import PaymentMethods from '@/components/profile/PaymentMethods';
import Subscriptions from '@/components/profile/Subscriptions';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountSection>('orders');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Session Gatekeeper: Redirect to signup if not authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/customer');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // If the server returns 401 or no token, send to signup
          router.push('/signup');
        }
      } catch (err) {
        router.push('/signup');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Logout Logic
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        // Clear local storage/state and redirect to home
        window.location.href = '/'; 
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <div className="flex justify-center pt-4 md:pt-12"><OrdersContent /></div>;
      case 'details':
        return <AccountDetails user={user} />;
      case 'addresses':
        return <Addresses />;
      case 'payments':
        return <PaymentMethods />;
      case 'subscriptions':
        return <Subscriptions />;
      default:
        return <OrdersContent />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F6D8AB]">
        <p className="text-[#280F0B] font-medium animate-pulse">Loading your account...</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[#F6D8AB] px-6 py-12 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
            <h1 className="text-5xl md:text-6xl font-lora text-[#280F0B]">
              Account
            </h1>
            {user && (
              <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1">
                {/* Welcome Text */}
                <p className="text-[#280F0B] font-medium opacity-80 uppercase tracking-widest text-sm">
                  Hi, {user.firstName}
                </p>
                
                {/* Logout Button: Right of name on mobile, Below name on desktop */}
                <button
                  onClick={handleLogout}
                  className="text-[11px] md:text-xs font-bold text-red-700/60 hover:text-red-700 uppercase tracking-widest transition-colors border-l md:border-none border-[#280F0B20] pl-4 md:pl-0"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-6 min-w-[200px] border-b border-[#3D1F16]/10 pb-8 md:border-none md:pb-0">
              <div className="flex flex-col gap-6">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id as AccountSection)}
                    className={`text-left text-xl transition-all duration-300 ease-out ${
                      activeTab === section.id
                        ? 'text-[#280F0B] font-semibold scale-105 origin-left'
                        : 'text-[#280F0B]/40 hover:text-[#280F0B]/70 hover:scale-105 origin-left'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Dynamic Content Area */}
            <main className="flex-1 min-h-[400px]">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}