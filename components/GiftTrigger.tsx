'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface GiftTriggerProps {
  onOpen: () => void;
}

export default function GiftTrigger({ onOpen }: GiftTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [triggerText, setTriggerText] = useState('Grab 20% Off');

  // Fetch the same newsletter details to keep the offer text consistent
  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch('/api/newsletter/details');
        const data = await res.json();
        // If your Klaviyo list has a specific offer name, update it here
        if (data.offerText) setTriggerText(data.offerText);
      } catch (err) {
        console.error("Gift trigger fetch error:", err);
      }
    }
    fetchOffer();
  }, []);

  return (
    <motion.div 
      className="fixed bottom-6 left-6 z-[50] cursor-pointer flex items-center overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
      initial={false}
      animate={{
        // Dynamic width based on text length when hovered
        width: isHovered ? '200px' : '56px', 
        backgroundColor: '#7F3E2F', 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        height: '56px',
        borderRadius: '28px',
      }}
    >
      {/* Icon Section */}
      <div className="relative min-w-[56px] h-[56px] flex items-center justify-center">
        <div className="relative z-10 w-6 h-6">
          <Image 
            src="/assets/images/gift.svg" 
            alt="gift icon" 
            fill 
            className="object-contain" 
          />
        </div>
      </div>

      {/* Text Label Section */}
      <div className="flex items-center pr-6 overflow-hidden">
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -10 
          }}
          transition={{ duration: 0.2 }}
          className="font-manrope text-white text-[15px] font-bold whitespace-nowrap uppercase tracking-wider"
        >
          {triggerText}
        </motion.span>
      </div>
    </motion.div>
  );
}