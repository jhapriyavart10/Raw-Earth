'use client';

import Header from '@/components/Header';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRY_DATA: Record<string, string[]> = {
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"]
};

const svgPathsDesktop = {
  p1553ba00: "M8 7.25C7.58579 7.25 7.25 7.58579 7.25 8C7.25 8.41421 7.58579 8.75 8 8.75V8V7.25ZM25.5303 8.53033C25.8232 8.23744 25.8232 7.76256 25.5303 7.46967L20.7574 2.6967C20.4645 2.40381 19.9896 2.40381 19.6967 2.6967C19.4038 2.98959 19.4038 3.46447 19.6967 3.75736L23.9393 8L19.6967 12.2426C19.4038 12.5355 19.4038 13.0104 19.6967 13.3033C19.9896 13.5962 20.4645 13.5962 20.7574 13.3033L25.5303 8.53033ZM8 8V8.75H25V8V7.25H8V8Z",
};

type FormErrors = {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  streetAddress?: boolean;
  townCity?: boolean;
  postcode?: boolean;
  state?: boolean;
};

export default function CheckoutPage() {
  const { 
    cartItems, 
    cartId, 
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
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [couponExpanded, setCouponExpanded] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingDropdownOpen, setShippingDropdownOpen] = useState(false);
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Australia',
    streetAddress: '',
    apartment: '',
    townCity: '',
    pincode: '',
    state: '',
    orderNotes: ''
  });

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('user_addresses');
    if (saved) {
      const addresses = JSON.parse(saved);
      if (addresses.length > 0) {
        const primary = addresses[addresses.length - 1]; 
        setFormData(prev => ({
          ...prev,
          firstName: primary.firstName || '',
          lastName: primary.lastName || '',
          country: primary.country || 'Australia',
          streetAddress: primary.address1 || '',
          apartment: primary.address2 || '',
          townCity: primary.city || '',
          state: primary.state || '',
          phone: primary.phone || ''
        }));
      }
    }
  }, []);

  const filteredCountries = useMemo(() => {
    return Object.keys(COUNTRY_DATA).filter(c => 
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const handleCountrySelect = (country: string) => {
    setFormData({ ...formData, country, state: '' });
    setIsCountryOpen(false);
    setCountrySearch('');
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = true;
    if (!formData.lastName.trim()) newErrors.lastName = true;
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = true;
    if (!formData.streetAddress.trim()) newErrors.streetAddress = true;
    if (!formData.townCity.trim()) newErrors.townCity = true;
    if (!formData.pincode.trim()) newErrors.postcode = true;
    if (!formData.state) newErrors.state = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentClick = async () => {
    if (!isHydrated) return;

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!cartId || cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/shopify/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, customerDetails: formData, shippingMethod }), 
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL missing");
      }
    } catch (err) {
      console.error("Payment Redirect Error:", err); 
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } 
    finally {
      setIsProcessing(false);
    }
  };

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplying(true);
    const result = await applyCoupon(couponCode);
    setCouponMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    setIsApplying(false);
  };

  if (!isHydrated) {
    return (
      <div className="bg-[#F6D8AB] min-h-screen flex items-center justify-center font-lora text-xl">
        Initializing Secure Checkout...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#F6D8AB] min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-3xl font-lora mb-4">Your cart is empty</h2>
        <p className="mb-6 opacity-70">Please add some products to your cart before proceeding to checkout.</p>
        <Link href="/product-analogue" className="bg-[#280F0B] text-[#F6D8AB] px-8 py-3 rounded-full font-bold uppercase tracking-wider">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F6D8AB] w-full min-h-screen font-manrope text-[#280F0B]">
      <Header />
      
      <main className="max-w-[1440px] mx-auto px-6 py-6 md:px-12 lg:px-[72px] lg:py-[50px]">
        {/* Progress Stepper */}
        <div className="hidden md:flex items-center gap-4 mb-12">
          <Link href="/cart" className="flex gap-3 items-center group cursor-pointer">
            <div className="bg-[#280f0b] flex items-center justify-center rounded-full size-[30px] text-[#f6d8ab] font-bold group-hover:scale-110 transition-transform">1</div>
            <p className="text-[#280f0b] text-base group-hover:underline">Shopping Cart</p>
          </Link>
          <div className="w-[33px] h-[16px] opacity-40">
            <svg className="w-full h-full" fill="none" viewBox="0 0 33 16"><path d={svgPathsDesktop.p1553ba00} fill="black" /></svg>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-[#280f0b] flex items-center justify-center rounded-full size-[30px] text-[#f6d8ab] font-bold">2</div>
            <p className="text-[#280f0b] text-base ">Checkout</p>
          </div>
          <div className="w-[33px] h-[16px] opacity-40">
            <svg className="w-full h-full" fill="none" viewBox="0 0 33 16"><path d={svgPathsDesktop.p1553ba00} fill="black" /></svg>
          </div>
          <div className="flex gap-3 items-center opacity-40">
            <div className="bg-[#280f0b] flex items-center justify-center rounded-full size-[30px] text-[#f6d8ab] font-bold">3</div>
            <p className="text-[#280f0b] text-base">Order Complete</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start"> 
          <div className="flex-1 w-full order-1">
            <h1 className="font-lora text-[40px] lg:text-[72px] text-[#280f0b] leading-none mb-8">
              Checkout <span className="text-lg opacity-60 font-lora font-normal">({getTotalItems()} items)</span>
            </h1>
            
            <section className="space-y-8 mt-8">
              {isHydrated && JSON.parse (localStorage.getItem('user_addresses') || '[]').length > 0 && (
                <div className="mb-12 pb-8 border-b border-[#280F0B1A]">
                  <h3 className="text-lg font-bold mb-4 tracking-wider uppercase flex items-center gap-2">
                    <Image src="/assets/images/home.svg" alt="Address" width={24} height={24} />
                    Ship to a Saved Address
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {JSON.parse(localStorage.getItem('user_addresses') || '[]').map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => setFormData({
                          ...formData,
                          firstName: addr.firstName,
                          lastName: addr.lastName,
                          streetAddress: addr.address1,
                          apartment: addr.address2 || '',
                          townCity: addr.city,
                          state: addr.state,
                          pincode: addr.pincode || addr.postcode,
                          phone: addr.phone || ''
                        })}
                        className={`min-w-[280px] p-5 border cursor-pointer transition-all rounded-sm 
                          ${formData.streetAddress === addr.address1 
                            ? 'border-[#7F3E2F] bg-[#7F3E2F0D] ring-1 ring-[#7F3E2F]' 
                            : 'border-[#280F0B33] bg-transparent hover:border-[#280F0B]'}`}
                      >
                        <p className="font-bold text-sm">{addr.firstName} {addr.lastName}</p>
                        <p className="text-xs opacity-70 mt-1 truncate">{addr.address1}</p>
                        <p className="text-xs opacity-70">{addr.city}, {addr.state}</p>
                        {formData.streetAddress === addr.address1 && (
                          <p className="text-[10px] font-bold text-[#7F3E2F] mt-3 uppercase tracking-widest">Selected</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 tracking-wider uppercase">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder={errors.firstName ? "First Name Required *" : "First name"} 
                    value={formData.firstName}
                    onChange={(e) => { setFormData({...formData, firstName: e.target.value}); if(errors.firstName) setErrors({...errors, firstName: false}); }}
                    className={`w-full bg-transparent border p-4 outline-none transition-colors ${errors.firstName ? 'border-red-600 placeholder-red-600' : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'}`} 
                  />
                  <input 
                    type="text" 
                    placeholder={errors.lastName ? "Last Name Required *" : "Last name"} 
                    value={formData.lastName}
                    onChange={(e) => { setFormData({...formData, lastName: e.target.value}); if(errors.lastName) setErrors({...errors, lastName: false}); }}
                    className={`w-full bg-transparent border p-4 outline-none transition-colors ${errors.lastName ? 'border-red-600 placeholder-red-600' : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'}`} 
                  />
                  <input 
                    type="email" 
                    placeholder={errors.email ? "Valid Email Required *" : "Email Address"} 
                    value={formData.email}
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: false}); }}
                    className={`w-full bg-transparent border p-4 outline-none transition-colors md:col-span-2 ${errors.email ? 'border-red-600 placeholder-red-600' : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'}`} 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone (optional)" 
                    value={formData.phone}
                    onChange={(e) => {const onlyNums = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, phone: onlyNums})}}
                    className="w-full bg-transparent border border-[#280F0B66] p-4 outline-none focus:border-[#280F0B] placeholder-[#280F0B80] md:col-span-2" 
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 tracking-wider uppercase">Delivery</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div onClick={() => setIsCountryOpen(!isCountryOpen)} className="w-full bg-transparent border border-[#280F0B66] p-4 flex justify-between items-center cursor-pointer">
                      <span>{formData.country}</span>
                      <svg className={`w-4 h-4 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                    {isCountryOpen && (
                      <div className="absolute top-full left-0 w-full bg-[#F6D8AB] border border-[#280F0B66] z-50 shadow-xl rounded-b-md">
                        <input type="text" autoFocus placeholder="Search countries..." className="w-full p-4 bg-white/20 border-b border-[#280F0B33] outline-none" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} />
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCountries.map(country => (
                            <div key={country} className="p-4 hover:bg-[#280F0B] hover:text-[#F6D8AB] cursor-pointer transition-colors" onClick={() => handleCountrySelect(country)}>{country}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    name="address"
                    autoComplete="shipping street-address"
                    placeholder={errors.streetAddress ? "Street Address Required *" : "Street Address"} 
                    value={formData.streetAddress}
                    onChange={(e) => { setFormData({...formData, streetAddress: e.target.value}); if(errors.streetAddress) setErrors({...errors, streetAddress: false}); }}
                    className={`w-full bg-transparent border p-4 outline-none transition-colors ${errors.streetAddress ? 'border-red-600 placeholder-red-600' : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'}`} 
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="city"
                      autoComplete="shipping address-level2"
                      placeholder={errors.townCity ? "City Required *" : "Town/City"} 
                      value={formData.townCity}
                      onChange={(e) => { setFormData({...formData, townCity: e.target.value}); if(errors.townCity) setErrors({...errors, townCity: false}); }}
                      className={`w-full bg-transparent border p-4 outline-none transition-colors ${errors.townCity ? 'border-red-600 placeholder-red-600' : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'}`} 
                    />
                    <input 
                      type="text" 
                      name="postalCode"
                      autoComplete="shipping postal-code"
                      placeholder={errors.postcode ? "Postcode Required *" : "Postcode"} 
                      value={formData.pincode}
                      onChange={(e) => { setFormData({...formData, pincode: e.target.value}); if(errors.postcode) setErrors({...errors, postcode: false}); }}
                      className={`w-full bg-transparent border p-4 outline-none transition-colors ${errors.postcode ? 'border-red-600 placeholder-red-600' : 'border-[#280F0B66] focus:border-[#280F0B] placeholder-[#280F0B80]'}`} 
                    />
                  </div>
                  <div className="relative">
                    <select 
                      value={formData.state} 
                      onChange={(e) => { 
                        setFormData({...formData, state: e.target.value}); 
                        if(errors.state) setErrors({...errors, state: false}); 
                      }} 
                      className={`w-full bg-transparent border p-4 outline-none appearance-none cursor-pointer transition-colors
                        ${errors.state 
                          ? 'border-red-600 text-red-600' 
                          : 'border-[#280F0B66] text-[#280F0B80] focus:border-[#280F0B]'
                        } 
                        ${!formData.state ? 'text-[#280F0B80]' : 'text-[#280F0B]'} `} 
                    >
                      <option value="" disabled>Select State/Province</option>
                      {COUNTRY_DATA[formData.country]?.map(state => (
                        <option key={state} value={state} className="text-[#280F0B]">
                          {state}
                        </option>
                      ))}
                    </select>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg 
                        className={`w-4 h-4 transition-transform ${errors.state ? 'text-red-600' : 'text-[#280F0B]'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {errors.state && (
                      <p className="text-red-600 text-xs mt-1 font-bold">Please select a state</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Dynamic Summary Card */}
          <div className="relative w-full max-w-[526px] mx-auto lg:mx-0 order-2">
            <div className="bg-[#FFC26F] rounded-[20px] overflow-hidden relative flex flex-col shadow-sm">
              
              <div className="p-6 lg:p-10 flex flex-col gap-4">
                <div className="flex justify-between items-center text-[#280f0b]">
                  <span className="text-base lg:text-lg">Subtotal</span>
                  <span className="font-semibold text-base lg:text-lg">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[#280F0B] ">
                    <span className="text-base lg:text-lg tracking-tight">Discount Applied</span>
                    <span className="font-semibold text-base lg:text-lg">-${discountAmount.toFixed(2)}</span>
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
                  <p className={`mt-3 text-[11px] font-bold uppercase tracking-widest ${couponMessage.type === 'error' ? 'text-red-700' : 'text-[#280F0B]'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>
              
              {/* Bottom Divider (Just Border, No Cutouts) */}
              <div className="relative w-full">
                <div className="border-t border-dashed border-[#280f0b]/30 w-full" />
                {/* REMOVED: Duplicate cutouts here */}
              </div>

              <div className="p-6 lg:p-10 flex flex-col">
                <div className="flex justify-between items-center mb-10 text-[#280f0b]">
                  <span className="text-2xl font-bold">Total</span>
                  <span className="text-2xl font-bold">${finalTotal.toFixed(2)} AUD</span>
                </div>

                <button 
                  disabled={isProcessing}
                  onClick={handlePaymentClick}
                  className="w-full relative overflow-hidden bg-[#592B1E] text-[#fcf3e5] py-5 flex items-center justify-center gap-3 transition-all uppercase tracking-[1.12px] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed z-10 before:absolute before:inset-0 before:bg-[#280F0B] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting...
                    </span>
                  ) : (
                    <>
                      Complete Payment
                      <svg className="w-5 h-3" viewBox="0 0 18 12" fill="none">
                        <path d="M12 1L17 6L12 11M1 6H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}