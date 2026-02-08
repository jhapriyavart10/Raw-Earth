'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice in localStorage
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6 pointer-events-none"
        >
          <div className="pointer-events-auto max-w-[1200px] mx-auto bg-[#F6D8AB] border border-[#280F0B]/20 shadow-2xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             
            {/* Background texture or slight noise could go here if desired */}
            
            <div className="flex-1 z-10">
              <h3 className="text-[#280F0B] font-lora text-xl font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🍪</span> We respect your privacy
              </h3>
              <p className="text-[#280F0B]/80 font-manrope text-sm leading-relaxed max-w-2xl">
                We use cookies to enhance your shopping experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our <Link href="/policies/privacy" className="underline font-bold hover:text-[#7F3E2F]">Privacy Policy</Link>.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto z-10">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-3 text-[#280F0B] font-manrope font-bold text-sm uppercase tracking-wider hover:opacity-60 transition-opacity"
              >
                Decline
              </button>
              
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none relative overflow-hidden bg-[#592B1E] text-[#FCF3E5] px-10 py-4 rounded-sm font-manrope font-bold text-sm uppercase tracking-wider transition-all z-10 before:absolute before:inset-0 before:bg-[#280F0B] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10 shadow-lg"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}