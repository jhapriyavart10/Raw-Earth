'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

function SignInForm() {
  const [activeChakra, setActiveChakra] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // --- HANDLE URL ERRORS (e.g. Google Login Failures) ---
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam === 'google_account_exists_please_login_manually') {
      setErrorMessage("An account with this email already exists. Please log in with your password.");
    } else if (errorParam === 'no_code') {
      setErrorMessage("Google Login failed. Please try again.");
    }
  }, [errorParam]);
 
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChakra((prev) => (prev === 7 ? 1 : prev + 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const currentEmail = formData.get('email') as string;
    const isRememberChecked = formData.get('remember') === 'on';
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          rememberMe: isRememberChecked, 
        }),
      });

      if (res.ok) {
        if (isRememberChecked) {
          localStorage.setItem('rememberedEmail', currentEmail);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        window.location.href = '/product-analogue'; 
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI || '',
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      prompt: 'select_account',
      access_type: 'offline',
    };

    const queryString = new URLSearchParams(options).toString();
    window.location.href = `${rootUrl}?${queryString}`;
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-[#F6D8AB] min-h-[calc(100vh-80px)]">
        
        {/* Left Visual Illustration Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative min-h-[400px]">
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            <div className="absolute inset-0">
              <Image src="/assets/images/body.svg" alt="Meditation Pose" fill className="object-contain opacity-80" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-between h-[60%] gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="w-8 h-8 relative">
                  <div className={`absolute inset-0 transition-opacity duration-500 ${activeChakra === num ? 'opacity-100' : 'opacity-0'}`}>
                    <Image src={`/assets/images/chakra${num}.svg`} alt={`Chakra ${num}`} fill className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Login Form Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-lora text-4xl md:text-5xl text-[#280F0B] font-medium mb-4 tracking-tight">Welcome back!</h1>
              <p className="font-manrope text-[#280F0B]/60 text-base font-medium">Enter login details to go ahead.</p>
            </div>

            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-6 font-manrope text-sm flex justify-between items-center"
                >
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">×</button>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin}>
              <div className="space-y-10">
                {/* Email Field with Animated Border */}
                <div className="relative group w-full">
                  <input
                    required
                    name="email"
                    type="email"
                    defaultValue={email}
                    placeholder="Email"
                    className="peer w-full py-2 bg-transparent font-manrope outline-none placeholder:text-[#280F0B]/40 text-[#280F0B] text-base"
                  />
                  <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#280F0B]/30" />
                  <span
                    className="absolute left-0 bottom-0 h-[1px] w-full bg-[#280F0B]
                              scale-x-0 origin-left transition-transform duration-300
                              peer-focus:scale-x-100"
                  />
                </div>

                {/* Password Field with Animated Border and Eye Icon */}
                <div className="relative group w-full">
                  <input
                    required
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="peer w-full py-2 pr-10 bg-transparent font-manrope outline-none placeholder:text-[#280F0B]/40 text-[#280F0B] text-base"
                  />
                  
                  {/* Eye Icon Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#280F0B]/40 hover:text-[#280F0B] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#280F0B]/30" />
                  <span
                    className="absolute left-0 bottom-0 h-[1px] w-full bg-[#280F0B]
                              scale-x-0 origin-left transition-transform duration-300
                              peer-focus:scale-x-100"
                  />
                </div>
              </div>

              {/* REMEMBER ME + FORGOT PASSWORD */}
              <div className="flex items-center justify-between mt-10">
                  <div className="flex items-center gap-3 group cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="remember" 
                        name="remember" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="appearance-none w-4 h-4 border border-[#280F0B]/50 bg-transparent rounded-sm checked:bg-[#280F0B] checked:border-transparent cursor-pointer transition-all relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[5px] after:h-[9px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" 
                      />
                      <label htmlFor="remember" className="font-manrope text-sm text-[#280F0B]/70 cursor-pointer">Remember me</label>
                  </div>
                  
                  {/* Forgot Password Link */}
                  <Link href="/recover" className="font-manrope text-sm text-[#280F0B]/70 hover:text-[#280F0B] underline transition-colors">
                    Forgot Password?
                  </Link>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 mt-6 border border-[#280F0B] text-[#280F0B] font-manrope font-semibold uppercase tracking-widest text-sm hover:bg-[#280F0B] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'LOGIN'}
              </button>

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-[#280F0B]/20"></div>
                <span className="flex-shrink mx-4 text-[#280F0B]/40 text-sm">OR</span>
                <div className="flex-grow border-t border-[#280F0B]/20"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 flex items-center justify-center gap-3 border border-[#280F0B] text-[#280F0B] font-manrope font-semibold uppercase tracking-widest text-sm hover:bg-[#280F0B] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                <Image src="/assets/images/google-logo.svg" alt="Google" width={20} height={20} />
                CONTINUE WITH GOOGLE
              </button>
            </form>

            <div className="pt-6 text-left">
              <p className="font-manrope text-sm text-[#280F0B]/60">
                Don't have an account? <Link href="/signup" className="underline hover:text-[#280F0B] font-medium">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="bg-[#F6D8AB] min-h-screen"></div>}>
        <SignInForm />
      </Suspense>
    </>
  );
}