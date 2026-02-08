'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, ChevronDown, CircleX } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems,
    setIsCartDrawerOpen,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    // Import calculated values directly from Context
    subtotal,
    finalTotal
  } = useCart(); 

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [couponExpanded, setCouponExpanded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  useEffect(() => {
    if (setIsCartDrawerOpen) {
      setIsCartDrawerOpen(isOpen);
    }
  }, [isOpen, setIsCartDrawerOpen]);

  // REMOVED: Local tax/total calculation. 
  // We now use 'subtotal' and 'finalTotal' directly from useCart() to ensure consistency.

  const handleApply = async () => {
    if (!couponCode) return;
    setIsApplying(true);
    setCouponMessage({ text: '', type: '' });

    const result = await applyCoupon(couponCode); 
    setCouponMessage({ 
      text: result.message, 
      type: result.success ? 'success' : 'error' 
    });
    
    if (result.success) setCouponCode('');
    setIsApplying(false);
  };

  const goToCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-[400] flex justify-end transition-opacity duration-800 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <section 
        className={`relative flex h-full w-full flex-col bg-[#f6d8ab] shadow-2xl transition-transform duration-300 ease-in-out md:w-[486px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#280f0b]/10 px-6 py-8">
          <div className="flex items-baseline gap-2">
            <h2 className="font-lora text-4xl text-[#280f0b]">Cart</h2>
            <span className="font-manrope text-lg opacity-70">({getTotalItems()} items)</span>
          </div>
          <button onClick={onClose} className="text-[#280f0b] hover:rotate-90 transition-transform">
            <X size={32} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-lora text-xl opacity-60">Your cart is empty</p>
              <Link 
                href="/product-analogue" 
                onClick={onClose} 
                className="mt-4 underline font-bold inline-block text-[#280f0b]"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {cartItems.map((item) => (
                <div key={item.id} className="group flex gap-4">
                  <div className="relative h-28 w-24 flex-shrink-0">
                    <div className="h-full w-full overflow-hidden rounded bg-white/50">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-2 -left-2 z-10 bg-white rounded-full text-[#280f0b] hover:text-red-600 shadow-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      title="Remove item"
                    >
                      <CircleX size={22} fill="currentColor" stroke="white" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h3 className="font-manrope font-semibold text-[#280f0b] leading-tight break-words">
                          {item.title}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-[#7f3e2f] mt-1 uppercase tracking-wider">{item.variant}</p>
                        )}
                      </div>
                      <p className="font-manrope text-[13px] text-[#280f0b] whitespace-nowrap flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)} <span className="text-[13px]">AUD</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between border border-[#280f0b] px-3 py-1 w-28 mt-4">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          } else {
                            removeFromCart(item.id);
                          }
                        }}
                        className="text-[#280f0b] hover:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-[#280f0b]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-[#280f0b] hover:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-[#280f0b]/30">
          {!appliedCoupon ? (
            <>
              <button 
                onClick={() => setCouponExpanded(!couponExpanded)}
                className="flex w-full items-center justify-between px-6 py-5 hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-5">
                    <Image src="/assets/images/coupon.svg" alt="Coupon" fill className="object-contain" />
                  </div>
                  <span className="font-manrope font-medium text-[#280f0b]">Have a coupon code?</span>
                </div>
                <ChevronDown className={`transition-transform text-[#280f0b] ${couponExpanded ? 'rotate-180' : ''}`} size={20} />
              </button>
              {couponExpanded && (
                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code" 
                      className="flex-1 bg-white/50 border border-[#280f0b]/20 p-3 rounded text-sm text-[#280f0b] placeholder-[#280f0b]/40 focus:outline-none"
                    />
                    <button 
                      onClick={handleApply}
                      disabled={isApplying}
                      className="bg-[#280F0B] text-[#F6D8AB] px-4 rounded text-xs font-bold uppercase hover:bg-black transition-all disabled:opacity-50"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponMessage.text && (
                    <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${couponMessage.type === 'error' ? 'text-red-700' : 'text-green-800'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-5 flex items-center justify-between bg-green-800/5">
              <div className="flex items-center gap-3">
                <Image src="/assets/images/coupon.svg" alt="Coupon" width={18} height={18} />
                <span className="text-[11px] font-bold text-[#280f0b] tracking-widest">
                  {appliedCoupon} APPLIED
                </span>
              </div>
              <button 
                onClick={removeCoupon}
                className="text-[#280f0b] opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#280f0b] p-8 text-[#f6d8ab]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <p className="opacity-70">Subtotal (incl. tax)</p>
              <p className="font-bold">${subtotal.toFixed(2)} AUD</p>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm ">
                <p className="opacity-70">Discount</p>
                <p className="font-semibold">-${discountAmount.toFixed(2)} AUD</p>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mb-8 border-t border-[#f6d8ab]/10 pt-4">
            <div className="flex-1 mr-4">
              <p className="text-[18px] font-bold font-lora">Total</p>
              <p className="text-[11px] md:text-[13px] opacity-60 mt-1 tracking-tight">
                Shipping calculated at checkout.
              </p>
            </div>
            <p className="text-[15px] min-[370px]:text-[22px] font-bold font-manrope whitespace-nowrap">
              ${finalTotal.toFixed(2)} AUD
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center border border-[#f6d8ab]/40 py-4 text-xs font-bold uppercase tracking-[1.5px] hover:bg-white/10 transition-all"
            >
              View Cart
            </Link>
            <button 
              onClick={goToCheckout}
              disabled={isRedirecting || cartItems.length === 0}
              className="bg-[#7f3e2f] flex items-center justify-center py-4 text-xs font-bold uppercase tracking-[1.5px] text-white hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isRedirecting ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}