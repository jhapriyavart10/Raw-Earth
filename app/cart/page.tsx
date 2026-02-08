'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import Header from '@/components/Header';
import Link from 'next/link';
import { ChevronDown, Check, ArrowRight, Trash2 } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems,
    applyCoupon, 
    removeCoupon, 
    appliedCoupon, 
    discountAmount,
    shippingMethod,
    setShippingMethod,
    shippingCost,
    subtotal,
    finalTotal,
    freeShippingThreshold
  } = useCart();

  const [couponExpanded, setCouponExpanded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [shippingDropdownOpen, setShippingDropdownOpen] = useState(false);

  const handleApplyCoupon = async () => {
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

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="bg-[#f6d8ab] min-h-screen w-full font-manrope">
      <Header />
      
      <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-12 lg:px-[72px] lg:py-[50px]">
        
        {/* Progress Indicator */}
        <div className="hidden md:flex items-center gap-4 mb-12">
          <div className="flex gap-3 items-center">
            <div className="bg-[#280f0b] flex items-center justify-center rounded-full size-[30px] text-[#f6d8ab] font-bold">1</div>
            <p className="text-[#280f0b] text-base">Shopping Cart</p>
          </div>
          <div className="w-[33px] flex items-center justify-center opacity-40">
             <ArrowRight size={16} />
          </div>
          <Link href="/checkout" className="flex gap-3 items-center opacity-40 hover:opacity-100 transition-opacity">
            <div className="bg-[#280f0b] flex items-center justify-center rounded-full size-[30px] text-[#f6d8ab] font-bold">2</div>
            <p className="text-[#280f0b] text-base font-medium">Checkout</p>
          </Link>
          <div className="w-[33px] flex items-center justify-center opacity-40">
             <ArrowRight size={16} />
          </div>
          <div className="flex gap-3 items-center opacity-40">
            <div className="bg-[#280f0b] flex items-center justify-center rounded-full size-[30px] text-[#f6d8ab] font-bold">3</div>
            <p className="text-[#280f0b] text-base">Order Complete</p>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="mb-8 flex items-baseline gap-2">
          <h1 className="font-lora text-[40px] lg:text-[72px] text-[#280f0b] leading-none">Cart</h1>
          <p className="font-lora text-base lg:text-xl text-[#280f0b] opacity-80">({getTotalItems()} items)</p>
        </div>
        
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_526px] gap-10">
          
          {/* Left: Items Section */}
          <div className="flex flex-col gap-6">
            <div className="hidden lg:grid grid-cols-[1fr_120px_100px] border-b border-[#280f0b]/40 pb-6 mb-4">
              <p className="text-[12px] font-bold tracking-[1.2px] uppercase">Product</p>
              <p className="text-[12px] font-bold tracking-[1.2px] uppercase text-center">Quantity</p>
              <p className="text-[12px] font-bold tracking-[1.2px] uppercase text-right">Subtotal</p>
            </div>
            
            {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-b border-[#280f0b]/10">
              <p className="font-lora text-xl opacity-60 mb-6">Your cart is currently empty.</p>
              <Link href="/product-analogue" className="underline font-bold text-[#280f0b]">
                Continue Shopping
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex flex-col lg:grid lg:grid-cols-[1fr_120px_100px] lg:items-center gap-6 lg:gap-0">
                <div className="flex gap-4">
                  <div className="relative size-[95px] lg:size-[110px] shrink-0">
                    <Image alt={item.title} src={item.image} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <p className="text-[#280f0b] text-base font-medium leading-none">{item.title}</p>
                    <p className="text-[#7f3e2f] text-sm font-medium leading-none">{item.variant}</p>
                    
                    {/* Mobile Controls */}
                    <div className="flex flex-col gap-3 lg:hidden mt-1">
                      <p className="text-[#280f0b] text-sm font-semibold">${item.price.toFixed(2)} AUD</p>
                      
                      <div className="flex items-center justify-between border border-[#280f0b] px-3 py-1.5 gap-6 w-[110px]">
                        <button 
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)} 
                          className="text-[20px] font-medium leading-none"
                        >
                          -
                        </button>
                        <span className="text-base font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[20px] font-medium leading-none">+</button>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="text-[#474747] hover:text-[#7f3e2f] transition-colors w-fit">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Desktop Price & Delete */}
                    <p className="hidden lg:block text-[#280f0b] text-sm font-semibold">${item.price.toFixed(2)} AUD</p>
                    <button onClick={() => removeFromCart(item.id)} className="hidden lg:block text-[#474747] hover:text-[#7f3e2f] transition-colors mt-2 w-fit">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Desktop Quantity Controls */}
                <div className="hidden lg:flex lg:justify-center items-center">
                  <div className="flex items-center justify-between border border-[#280f0b] rounded-[6px] px-3 py-1.5 gap-6 w-[110px]">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)} 
                      className="text-[20px] font-medium leading-none"
                    >
                      -
                    </button>
                    <span className="text-base font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[20px] font-medium leading-none">+</button>
                  </div>
                </div>

                <p className="hidden lg:block text-right text-[13px] font-semibold text-black">
                  ${(item.price * item.quantity).toFixed(2)} AUD
                </p>
              </div>
            )))}
          </div>
          
          {/* Right: Summary Card */}
          <div className="relative w-full max-w-[526px] mx-auto lg:mx-0">
            <div className="bg-[#FFC26F] rounded-[20px] overflow-hidden relative flex flex-col shadow-sm">
              
              <div className="p-6 lg:p-10 flex flex-col gap-4">
                <div className="flex justify-between items-center text-[#280f0b]">
                  <span className="text-base lg:text-lg">Subtotal</span>
                  <span className="font-semibold text-base lg:text-lg">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[#280F0B] ">
                    <span className="text-base lg:text-lg tracking-tight">Discount</span>
                    <span className="font-semibold text-base lg:text-lg text-[#280F0B]">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center relative z-20">
                  <span className="text-base lg:text-lg text-[#280f0b]">Shipping</span>

                  <div className="relative">
                    <button 
                      onClick={() => setShippingDropdownOpen(!shippingDropdownOpen)}
                      className="flex items-center gap-3 bg-[#f6d8ab] border border-[#280f0b]/10 rounded-lg px-4 py-3 text-sm font-bold text-[#280f0b] hover:bg-[#ffe3b9] transition-colors shadow-sm min-w-[200px] justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={shippingMethod === 'express' ? "/assets/images/express.svg" : "/assets/images/truck.svg"} alt="Shipping" fill className="object-contain" />
                        </div>
                        <span>{shippingMethod === 'standard' ? 'Standard' : 'Express'} - ${shippingCost.toFixed(2)}</span>
                      </div>
                      <ChevronDown size={16} className={`transition-transform ${shippingDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {shippingDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-[#f6d8ab] text-[#280f0b] rounded-lg shadow-xl overflow-hidden z-50 border border-[#280f0b]/10"
                        >
                          <div 
                            onClick={() => { setShippingMethod('standard'); setShippingDropdownOpen(false); }}
                            className={`p-4 cursor-pointer hover:bg-black/5 flex items-center justify-between ${shippingMethod === 'standard' ? 'bg-black/5' : ''}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">Standard</span>
                              <span className="text-xs opacity-70">7-14 Business Days</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {subtotal >= freeShippingThreshold ? <span className="font-bold text-[#280F0B]">FREE</span> : <span className="font-bold">$9.00</span>}
                              {shippingMethod === 'standard' && <Check size={16} />}
                            </div>
                          </div>
                          <div 
                            onClick={() => { setShippingMethod('express'); setShippingDropdownOpen(false); }}
                            className={`p-4 cursor-pointer hover:bg-black/5 flex items-center justify-between ${shippingMethod === 'express' ? 'bg-black/5' : ''}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">Express</span>
                              <span className="text-xs opacity-70">1-2 Days</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#280F0B]">$14.95</span>
                              {shippingMethod === 'express' && <Check size={16} />}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="px-6 lg:px-10 pb-6">
                <p className="text-medium text-left text-[#280f0b] mb-2 font-medium tracking-wide">
                  {amountToFreeShipping > 0 ? (
                    <>
                      <span className="font-extrabold">${amountToFreeShipping.toFixed(2)}</span> away from free shipping!
                    </>
                  ) : (
                    <span className="font-extrabold">You've unlocked FREE shipping!</span>
                  )}
                </p>
                <div className="w-full h-2 bg-[#280f0b]/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-[#7F3E2F]"
                  />
                </div>
              </div>

              <div className="relative w-full">
                <div className="border-t border-dashed border-[#280f0b]/30 w-full" />
                {/* REMOVED: Duplicate cutouts here */}
              </div>

              {/* Coupon Section with Integrated Cutouts */}
              <div className="px-6 lg:px-10 py-6 relative">
                {/* Semicircles vertically centered on the header row (approx 36px/2.25rem from top) */}
                <div className="absolute left-0 top-[2.25rem] -translate-y-1/2 -translate-x-1/2 size-8 rounded-full bg-[#f6d8ab] z-10 shadow-inner" />
                <div className="absolute right-0 top-[2.25rem] -translate-y-1/2 translate-x-1/2 size-8 rounded-full bg-[#f6d8ab] z-10 shadow-inner" />

                {!appliedCoupon ? (
                  <>
                    <button onClick={() => setCouponExpanded(!couponExpanded)} className="flex items-center gap-4 w-full group outline-none">
                      <div className="size-6 relative shrink-0">
                        <Image src="/assets/images/coupon.svg" alt="Coupon" fill className="object-contain" />
                      </div>
                      <span className="text-[#280f0b] font-medium text-base lg:text-lg group-hover:underline">Have a coupon code?</span>
                      <ChevronDown className={`ml-auto transition-transform ${couponExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${couponExpanded ? 'max-h-32 mt-4' : 'max-h-0'}`}>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code" 
                          className="flex-1 bg-white/40 border border-[#280f0b]/20 p-3 rounded text-sm text-[#280f0b] placeholder-[#280f0b]/50 outline-none focus:border-[#280f0b]" 
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={isApplying}
                          className="bg-[#280F0B] text-[#F6D8AB] px-4 rounded text-xs font-bold uppercase hover:bg-black disabled:opacity-50"
                        >
                          {isApplying ? '...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center py-2 bg-[#280F0B]/5 p-3 rounded border border-[#280F0B]/10">
                    <div className="flex items-center gap-3">
                      <Image src="/assets/images/coupon.svg" alt="Coupon" width={20} height={20} className="object-contain" />
                      <p className="text-[12px] font-bold text-[#280F0B] tracking-wider">CODE: {appliedCoupon} APPLIED</p>
                    </div>
                    <button onClick={removeCoupon} className="text-[11px] underline font-bold uppercase hover:text-red-700">Remove</button>
                  </div>
                )}
                {couponMessage.text && (
                  <p className={`mt-3 text-[11px] font-bold uppercase tracking-widest ${couponMessage.type === 'error' ? 'text-red-700' : 'text-green-800'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>
              
              {/* Bottom Divider (Just Border, No Cutouts) */}
              <div className="relative w-full">
                <div className="border-t border-dashed border-[#280f0b]/30 w-full" />
                {/* REMOVED: Duplicate cutouts here */}
              </div>

              <div className="p-6 lg:p-10 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-10 text-[#280f0b]">
                  <span className="text-2xl font-bold">Total</span>
                  <span className="text-2xl font-bold">${finalTotal.toFixed(2)} AUD</span>
                </div>

                {cartItems.length === 0 ? (
                   <button disabled className="w-full bg-[#7f3e2f] opacity-50 cursor-not-allowed text-[#fcf3e5] py-5 rounded-lg flex items-center justify-center gap-3 uppercase tracking-[1.12px] font-bold text-sm">
                      Checkout
                   </button>
                ) : (
                  <Link href="/checkout" className="w-full block mt-auto">
                    <button 
                      className="w-full relative overflow-hidden bg-[#592B1E] text-[#fcf3e5] py-5 flex items-center justify-center gap-3 transition-all uppercase tracking-[1.12px] font-bold text-sm z-10 before:absolute before:inset-0 before:bg-[#280F0B] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10"
                    >
                      Proceed to checkout
                      <ArrowRight size={20} color="#fcf3e5" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}