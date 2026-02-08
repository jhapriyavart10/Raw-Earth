'use client';
import { useState } from 'react';
import Image from 'next/image';
import ChatBotContent from '@/components/ChatBotContent';
import { useCart } from '@/app/context/CartContext';
import { motion } from 'framer-motion';

export default function FloatingChat() {
  const { isCartDrawerOpen , isPageLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setIsMaximized(false);
  };
  
  if (isCartDrawerOpen) return null;
  return (
    <div 
      className={`fixed z-[400] flex flex-col items-end gap-4 transition-all duration-500 
        ${isMaximized 
          ? 'inset-0 p-0 sm:p-6 bg-black/40 backdrop-blur-sm justify-center items-center'
          : 'bottom-4 right-4 min-[410px]:bottom-6 min-[410px]:right-6'
        }`}
    >
      {/* Chatbot Window Container */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0, x: 50, y: 50, originX: 1, originY: 1 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0, x: 50, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`shadow-2xl rounded-[24px] overflow-hidden bg-[#280F0B] 
            ${isMaximized 
              ? 'w-full h-full max-w-[1200px] rounded-none sm:rounded-[24px]'
              : 'w-[calc(100vw-32px)] min-[410px]:w-[375px] h-[600px] sm:h-[600px] max-h-[90vh]'
            }`}
        >
          <ChatBotContent 
            onClose={handleClose} 
            onToggleExpand={() => setIsMaximized(!isMaximized)}
            isMaximized={isMaximized}
          />
        </motion.div>
      )}

      {/* Floating Toggle Button */}
      {!isMaximized && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg rounded-full cursor-pointer z-[100] shrink-0
            ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          <Image
            src="/assets/images/circle.svg"
            alt="toggle background"
            fill
            className="object-contain"
          />
          <div className="relative w-7 h-7">
            <Image
              src={isOpen ? "/assets/images/drop.svg" : "/assets/images/chat.svg"}
              alt="chat status icon"
              fill
              className={`object-contain transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </button>
      )}
    </div>
  );
}