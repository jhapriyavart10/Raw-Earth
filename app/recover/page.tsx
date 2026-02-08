// app/recover/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: 'If that email is in our system, we have sent instructions to reset your password.' 
        });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send recovery email.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#F6D8AB] min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h1 className="font-lora text-3xl text-[#280F0B] font-medium mb-4">Reset Password</h1>
            <p className="font-manrope text-[#280F0B]/60 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {message && (
            <div className={`p-4 mb-6 text-sm rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group w-full">
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full py-2 bg-transparent font-manrope outline-none placeholder:text-[#280F0B]/40 text-[#280F0B] text-base"
              />
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#280F0B]/30" />
              <span className="absolute left-0 bottom-0 h-[1px] w-full bg-[#280F0B] scale-x-0 origin-left transition-transform duration-300 peer-focus:scale-x-100" />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 border border-[#280F0B] text-[#280F0B] font-manrope font-semibold uppercase tracking-widest text-sm hover:bg-[#280F0B] hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'SENDING...' : 'RESET PASSWORD'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/signin" className="font-manrope text-sm text-[#280F0B]/60 underline hover:text-[#280F0B]">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}