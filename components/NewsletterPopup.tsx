'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import GiftTrigger from './GiftTrigger';

export default function ImmersiveNewsletter() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [warning, setWarning] = useState('');
  const [copied, setCopied] = useState(false);
  
  // New state to track if the gift has been claimed
  const [isClaimed, setIsClaimed] = useState(false);

  const [newsletterData, setNewsletterData] = useState({
    title: "Grab a 20% off.",
    subheading: "To claim it tell us your primary spiritual focus.",
    couponCode: "", // Initialize empty
    options: [
      "Inner Peace & Emotional Balance",
      "Energy Cleansing & Protection",
      "Spiritual Growth & Intuition",
      "Manifestation & Abundance",
      "Love, Self-Worth & Relationships",
      "Purpose, Clarity & Life Direction"
    ]
  });

  const openPopup = () => {
    setStep(1); 
    setIsVisible(true);
  };

  // Check if already claimed on mount
  useEffect(() => {
    const claimed = localStorage.getItem('newsletter_claimed');
    if (claimed) {
      setIsClaimed(true);
    }
  }, []);

  // Fetch details (List Name & Coupon Code)
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch('/api/newsletter/details');
        const data = await res.json();
        setNewsletterData(prev => ({
          ...prev,
          title: data.name ? `Join ${data.name}` : prev.title,
          couponCode: data.couponCode || 'WELCOME20' // Use fetched code
        }));
      } catch (err) {
        console.error("Failed to fetch newsletter details:", err);
      }
    }
    fetchDetails();
  }, []);

  // Auto-show logic (only if not claimed and not seen this session)
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenNewsletter');
    const claimed = localStorage.getItem('newsletter_claimed');
    
    if (!hasSeenPopup && !claimed) {
      const timer = setTimeout(() => setIsVisible(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenNewsletter', 'true');
  };

  const handleViewCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // VALIDATION UPDATE
    if (!email || !firstName || !lastName) {
      setWarning('Please fill in all fields.');
      return;
    }
    if (!emailRegex.test(email)) {
      setWarning('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }) // SEND NAMES
      });

      if (response.ok) {
        setWarning('');
        setStep(3);
        setIsClaimed(true);
        localStorage.setItem('newsletter_claimed', 'true');
      } else {
        setWarning('Something went wrong. Please try again.');
      }
    } catch (error) {
      setWarning('Failed to connect. Please check your internet.');
    }
};

  const copyToClipboard = () => {
    // Use the dynamic code
    navigator.clipboard.writeText(newsletterData.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradientTextStyle = {
    background: 'linear-gradient(92.14deg, #FEFEFE 12.41%, #F6D8AB 105.08%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const h2Style = { 
    fontSize: '48px', 
    lineHeight: '100%', 
    fontWeight: 500, 
    letterSpacing: '0px' 
  };

  return (
    <>
    {/* Only show GiftTrigger if NOT claimed */}
    {!isClaimed && <GiftTrigger onOpen={openPopup} />}
    
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-black"
        >
          <div className="absolute inset-0">
            <Image
              src="/assets/images/newsletter.avif"
              alt="Raw Earth Background"
              fill
              className="object-cover"
              priority
            />
          </div>

          <button onClick={closePopup} className="absolute top-8 right-8 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-[#5D1F1F] text-white transition-transform hover:scale-110">
            <X className="w-6 h-6" />
          </button>

          <div className={`relative z-[105] w-full flex flex-col items-center text-center ${step > 1 ? '-mt-12' : ''}`}>
            <div className="mb-6 w-[240px] h-[120px] relative">
              <Image src="/assets/images/Logo(REC).svg" alt="Logo" fill style={{ filter: 'brightness(0) invert(1)' }} className="object-contain" />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <h2 style={{ ...h2Style, ...gradientTextStyle }} className="font-lora mb-2 tracking-normal">
                    {newsletterData.title}
                  </h2>
                  <p className="font-manrope text-white/90 text-[16px] leading-[24px] mb-6 whitespace-nowrap">
                    {newsletterData.subheading}
                  </p>

                  <div className="flex flex-col gap-2 w-full items-center mb-4">
                    {newsletterData.options.map((option) => (
                      <button 
                        key={option} 
                        onClick={() => setStep(2)} 
                        style={{ width: '350px', height: '48px', borderWidth: '1.25px', letterSpacing: '-0.005em' }} 
                        className="flex items-center justify-center border-white/60 text-white font-manrope font-normal text-[16px] leading-[24px] transition-all hover:bg-white hover:text-black"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button onClick={closePopup} className="font-manrope font-normal text-[16px] leading-[24px] text-white/70 hover:text-white underline underline-offset-4">
                    I don’t want a discount
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                  <h2 style={h2Style} className="font-lora mb-2 tracking-normal">
                    <span className="text-white">Reveal </span>
                    <span style={gradientTextStyle}>your code!</span>
                  </h2>
                  <p className="font-manrope text-white/90 text-[16px] leading-[24px] mb-8 whitespace-nowrap">
                    Enter your details & get the code.
                  </p>
                  <div className="flex flex-col gap-2 w-[350px] items-center">
                    {/* NEW INPUTS */}
                    <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="First Name" 
                        className="w-full h-[48px] bg-[#280F0B] text-white px-6 focus:outline-none font-manrope text-[16px] leading-[24px]"
                    />
                    <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Last Name" 
                        className="w-full h-[48px] bg-[#280F0B] text-white px-6 focus:outline-none font-manrope text-[16px] leading-[24px]"
                    />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => { setEmail(e.target.value); setWarning(''); }} 
                        placeholder="Your email address" 
                        className="w-full h-[48px] bg-[#280F0B] text-white px-6 focus:outline-none font-manrope text-[16px] leading-[24px]"
                    />
                    {warning && <p className="text-red-400 text-xs font-manrope">{warning}</p>}
                    <button onClick={handleViewCode} className="w-full h-[48px] border border-white text-white font-manrope font-normal text-[16px] leading-[24px] hover:bg-white hover:text-black transition-all">
                        View code →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                  <h2 style={{ ...h2Style, ...gradientTextStyle }} className="font-lora mb-2 tracking-normal">
                    Success! Check your inbox.
                  </h2>
                  <p className="font-manrope text-white/70 text-[16px] leading-[24px] mb-8 font-normal whitespace-nowrap">
                    Use this code & get <span className="font-semibold text-white">20% off.</span>
                  </p>
                  <div 
                    onClick={copyToClipboard}
                    style={{
                      width: '350px',
                      height: '44px',
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23FEFEFE' stroke-width='1.25' stroke-dasharray='2.5%2c 2.5' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                    }}
                    className="flex items-center justify-center gap-[8px] px-[20px] cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="font-manrope font-medium text-white text-[16px] tracking-widest uppercase">
                      {newsletterData.couponCode || 'WELCOME20'}
                    </span>
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}