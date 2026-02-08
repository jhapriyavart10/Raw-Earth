'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import Header from '@/components/Header';
import { useCart } from '@/app/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { AnimatePresence, motion } from 'framer-motion';
export const runtime = 'edge';
// Types for backend integration
interface Product {
  id: string;
  title: string;
  handle: string;
  price: number;
  image: string;
}

const materialOptions = [
  { name: 'Grey Jasper', img: '/assets/images/clear-quartz.svg' },
  { name: 'Blue Goldstone', img: '/assets/images/gold-stone.svg' },
  { name: 'Black Onyx', img: '/assets/images/Black-onyx.svg' },
  { name: 'White Agate', img: '/assets/images/white-agate.svg' },
  { name: 'Pink Shell', img: '/assets/images/white-howlite.svg' },
  { name: 'White Howlite', img: '/assets/images/white-howlite.svg' },
  { name: 'Blue Howlite', img: '/assets/images/white-howlite.svg' },
  { name: 'Turquoise Howlite', img: '/assets/images/white-howlite.svg' },
  { name: 'Gold Stone', img: '/assets/images/gold-stone.svg' },
  { name: 'Red Howlite', img: '/assets/images/white-howlite.svg' },
  { name: 'Sodalite', img: '/assets/images/clear-quartz.svg' },
  { name: 'Blue Lace Agate', img: '/assets/images/clear-quartz.svg' },
  { name: 'Opalite', img: '/assets/images/Blue-opalite.svg' },
  { name: 'Green Aventurine', img: '/assets/images/green-adventurine.svg' },
  { name: 'Moonstone', img: '/assets/images/clear-quartz.svg' },
  { name: 'Selenite', img: '/assets/images/clear-quartz.svg' },
  { name: 'Magnetite', img: '/assets/images/magnetite.svg' },
  { name: 'Blue Tiger Eye', img: '/assets/images/bluetiger-eye.svg' },
  { name: 'Volcanic Stone', img: '/assets/images/volcanic-stone.svg' },
  { name: 'Unakite', img: '/assets/images/unakite.svg' },
  { name: 'Labradorite', img: '/assets/images/labradorite.svg' },
  { name: 'Garnet', img: '/assets/images/garnet.svg' },
  { name: 'Malachite', img: '/assets/images/malachite.svg' },
  { name: 'Turquoise Stone', img: '/assets/images/Turquoise-stone.svg' },
  { name: 'Red Jasper', img: '/assets/images/white-howlite.svg' },
  { name: 'Red Agate', img: '/assets/images/red-agate.svg' },
  { name: 'Lapis Lazuli', img: '/assets/images/Lapis-Lazuli.svg' },
  { name: 'Rose Quartz', img: '/assets/images/rose-quartz.svg' },
  { name: 'Clear Quartz', img: '/assets/images/clear-quartz.svg' },
  { name: 'Amethyst', img: '/assets/images/Amethyst.svg' },
  { name: 'Tiger Eye', img: '/assets/images/tiger-eye.svg' },
  { name: 'Obsidian', img: '/assets/images/obsidian.svg' }
];

export default function UnifiedProductPage({ product }: { product: any }) {
  const numericProductId = useMemo(() => {
    const idToUse = product.productId || (product.id.includes('ProductVariant') ? null : product.id); 
    if (!idToUse){
      // console.error("Klaviyo Error: No parent Product ID found. Check your API response.");
      return '';
    } 
    return idToUse.split('/').pop();
  }, [product.productId, product.id]);

  const jewelleryImages = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/images/necklace-img.png'];

  const [selectedImage, setSelectedImage] = useState(product.image || jewelleryImages[0]);
  const [selectedMaterial, setSelectedMaterial] = useState("Obsidian");
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Notification Modal State
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Logic for Recommended Products Backend
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [klaviyoData, setKlaviyoData] = useState<any>(null);

  const productRating = parseFloat(product.rating || "0");
  const productReviewCount = parseInt(product.reviewCount || "0");

  const handleWriteReview = () => {
    const reviewSection = document.getElementById('reviews-section');
    if (reviewSection) {
      reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Try to find the widget after scrolling
      setTimeout(() => {
        const widgetContainer = document.getElementById('klaviyo-reviews-all');
        if (widgetContainer) {
          const internalButton = widgetContainer.querySelector('button') as HTMLElement;
          if (internalButton) {
            internalButton.click();
          } else {
            // Fallback: Dispatch event that Klaviyo sometimes listens to
            window.dispatchEvent(new CustomEvent('klaviyo-reviews-open-form'));
          }
        }
      }, 500);
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyStatus('loading');
    
    // 1. Get your public key from env (ensure it's loaded in next.config.js or via env)
    const KLAVIYO_PUBLIC_KEY = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY; 

    try {
      // 2. Use Klaviyo's Client-Side Back-in-Stock API
      const response = await fetch('https://a.klaviyo.com/api/v1/catalog/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          a: KLAVIYO_PUBLIC_KEY || '', 
          email: notifyEmail,
          variant: activeVariant?.id?.split('/').pop() || '', 
          product: product.id?.split('/').pop() || '',       
          platform: 'shopify'
        })
      });

      const data = await response.json();

      if (data.success) {
        setNotifyStatus('success');
        setTimeout(() => {
          setIsNotifyModalOpen(false);
          setNotifyStatus('idle');
          setNotifyEmail('');
        }, 2000);
      } else {
        console.error("Klaviyo Error:", data);
        setNotifyStatus('error');
      }
    } catch (error) {
      console.error("Notification subscription failed", error);
      setNotifyStatus('error');
    }
  };

  const handleAddToCart = () => {
    if (activeVariant?.quantityAvailable < 1) {
        return;
    }
    addToCart({ 
      id: activeVariant?.id || product.id, 
      title: product.title, 
      variant: selectedMaterial,
      price: activeVariant?.price || product.price,
      image: selectedImage || product.image 
    }, quantity);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    setIsCartOpen(true);
  };

  const handleShopPay = async () => {
    if (!activeVariant?.id) return;

    try {
      const response = await fetch('/api/shopify/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: activeVariant.id, 
          quantity: quantity
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout Redirect Error:", data.error || "Unknown Error");
        alert(data.error || "Failed to initiate checkout. Please try again.");
      }
    } catch (error) {
      console.error("Redirect failed", error);
    }
  };

  const handleMaterialClick = (materialName: string) => {
    setSelectedMaterial(materialName);
    const variantMatch = product.variants?.find((v: any) => 
      v.title.toLowerCase().includes(materialName.toLowerCase())
    );

    if (variantMatch) {
      setActiveVariant(variantMatch);
      if (variantMatch.image) {
        setSelectedImage(variantMatch.image);
      }
    }
  };

  const variantThumbnails = useMemo(() => {
    const images = product.variants
      ?.map((v: any) => v.image)
      .filter((img: string | null): img is string => !!img) || [];
    
    const baseImages = images.length > 0 ? images : (product.images || []);
    
    return baseImages.slice(0, 6);
  }, [product.variants, product.images]);

  const availableMaterials = useMemo(() => {
    return materialOptions.filter(option => 
      product.variants?.some((v: any) => 
        v.title.toLowerCase().includes(option.name.toLowerCase())
      )
    );
  }, [product.variants]);

  const chainOptions = useMemo(() => {
    const options = new Set<string>();
    product.variants?.forEach((variant: any) => {
      const chainValue = variant.selectedOptions?.["Chain Type"];
      if (chainValue) {
        options.add(chainValue);
      }
    });
    return Array.from(options);
  }, [product.variants]);

  const hasChainOptions = chainOptions.length > 0;
  const [selectedChain, setSelectedChain] = useState(chainOptions[0]);

  const specificSections = [
    { 
      title: 'Description', 
      content: product.descriptionHtml || product.description 
    },
    { 
      title: 'How to use', 
      content: product.howToUse || "Follow your intuition or use during meditation to connect with the crystal's energy." 
    },
    { 
      title: 'Product Details', 
      content: product.productDetails || "Ethically sourced natural crystal jewelry." 
    },
    { 
      title: 'Care Instructions', 
      content: product.careInstructions || "Handle gently and cleanse regularly with sage, moonlight, or sound." 
    }
  ];

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const response = await fetch('/api/shopify/products'); 
        const data = await response.json();
        const otherProducts = data.filter((p: Product) => p.id !== product.id);
        const shuffled = [...otherProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
          
        setRecommendedProducts(shuffled);
      } catch (error) {
        console.error("Failed to fetch recommended products:", error);
      } finally {
        setIsRecLoading(false);
      }
    }
    fetchRecommended();
  }, [product.id]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        if (!numericProductId) return;
        const response = await fetch(`/api/reviews/fetch?productId=${numericProductId}`);
        const data = await response.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsReviewsLoading(false);
      }
    }
    fetchReviews();
  }, [numericProductId]);

  useEffect(() => {
    if (product.variants && product.variants.length > 0 && availableMaterials.length > 0) {
      const firstVariant = product.variants[0];
      const mat = firstVariant.selectedOptions?.["Jewelry Material"];
      if (mat) {
         setSelectedMaterial(mat);
         setActiveVariant(firstVariant);
         if (firstVariant.image) setSelectedImage(firstVariant.image);
      }
    }
  }, [product]);

  useEffect(() => {
    const match = product.variants.find((v: any) => 
      v.selectedOptions["Jewelry Material"] === selectedMaterial &&
      v.selectedOptions["Chain Type"] === selectedChain
    );
    
    if (match) {
      setActiveVariant(match);
      if (match.image) setSelectedImage(match.image);
    }
  }, [selectedMaterial, selectedChain, product.variants]);

  useEffect(() => {
    if (!numericProductId) return;
    const checkForKlaviyoData = () => {
      const reviewsInstance = (window as any).KlaviyoReviews;
      if (reviewsInstance && reviewsInstance.getReviews) {
        const data = reviewsInstance.getReviews(numericProductId);
        if (data) {
          setKlaviyoData(data);
          return true;
        }
      }
      return false;
    };
    const interval = setInterval(() => {
      if (checkForKlaviyoData()) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [numericProductId]);

  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    const total = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r: any) => {
      const rating = Math.round(r.rating) as keyof typeof distribution;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
        sum += r.rating;
      }
    });
    const average = sum / total;
    const percentages = {
      5: (distribution[5] / total) * 100,
      4: (distribution[4] / total) * 100,
      3: (distribution[3] / total) * 100,
      2: (distribution[2] / total) * 100,
      1: (distribution[1] / total) * 100,
    };
    return { average, total, distribution, percentages };
  }, [reviews]);

  // Determine stock status based on user preference (< 5)
  const isOutOfStock = (activeVariant?.quantityAvailable ?? 0) == 0;

  return (
    <>
    {showNotification && (
        <div className="fixed top-5 right-5 z-[200] bg-[#280F0B] text-[#F6D8AB] px-5 py-4 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-3">
          <div className="bg-green-500 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-bold text-sm uppercase tracking-wide">
            {quantity} {product.title} added to cart
          </p>
        </div>
      )}

      {/* Notify Me Modal */}
      <AnimatePresence>
        {isNotifyModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsNotifyModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#F6D8AB] text-[#280F0B] p-8 rounded-lg shadow-2xl w-full max-w-md border border-[#280F0B]"
            >
              <button 
                onClick={() => setIsNotifyModalOpen(false)}
                className="absolute top-4 right-4 text-2xl leading-none hover:opacity-70"
              >
                &times;
              </button>
              
              <h3 className="text-2xl font-lora font-bold mb-2">Back in Stock?</h3>
              <p className="mb-6 opacity-80 text-sm">
                Get notified via email when <strong>{activeVariant?.title}</strong> is back in stock.
              </p>

              {notifyStatus === 'success' ? (
                <div className="bg-green-100 border border-green-500 text-green-800 p-4 rounded text-center">
                  <p className="font-bold">You're on the list!</p>
                  <p className="text-sm">We'll email you as soon as it arrives.</p>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col gap-4">
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter your email" 
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="p-3 bg-transparent border border-[#280F0B] rounded outline-none focus:ring-1 focus:ring-[#280F0B] placeholder-[#280F0B]/50"
                  />
                  <button 
                    type="submit" 
                    disabled={notifyStatus === 'loading'}
                    className="bg-[#280F0B] text-[#F6D8AB] py-3 rounded font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
                  >
                    {notifyStatus === 'loading' ? 'Subscribing...' : 'Notify Me'}
                  </button>
                  {notifyStatus === 'error' && <p className="text-red-600 text-xs text-center">Something went wrong. Please try again.</p>}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Header />
      <main className="bg-[#F6D8AB] text-[#280F0B] font-manrope min-h-screen">
        
        <section className="px-6 pt-6 lg:pt-12 lg:px-12 xl:px-24 2xl:px-32 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            
            {/* LEFT COLUMN: Image Gallery */}
            <div className="w-full">
              <p className="text-[12px] lg:text-sm mb-3 lg:mb-4 opacity-70">
                <Link href="/product-analogue" className="hover:text-black transition-colors">
                  <strong className="font-bold">Shop</strong>
                </Link> / Pendants / {product.title}
              </p>
              <div className="relative aspect-square w-full bg-[#F2EFEA] mb-3 lg:max-w-[820px]">
                <Image src={selectedImage} alt="Product" fill className="object-cover" priority />
              </div>
              <div className="grid grid-cols-6 gap-2 w-full lg:max-w-[820px]">
                {variantThumbnails.map((img: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => {
                      setSelectedImage(img);
                      const matchingVariant = product.variants?.find((v: any) => v.image === img);
                      if (matchingVariant) {
                        setSelectedMaterial(matchingVariant.title);
                        setActiveVariant(matchingVariant);
                      }
                    }}
                    className={`aspect-square cursor-pointer transition-all ${selectedImage === img ? 'border-2 border-[#280F0B]' : 'border border-[#280F0B]/30'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${index}`} width={100} height={100} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Details */}
            <div className="flex flex-col justify-start">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold mb-2 lg:mb-3 lg:mt-8">{product.title}</h1>
              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <span className="text-[#F5B301] text-lg lg:text-2xl">★ ★ ★ ★ ★</span>
                <button onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[12px] lg:text-sm cursor-pointer bg-transparent border-none p-0">[{reviews.length} reviews]</button>
              </div>

              <p className="text-[14px] lg:text-[16px] leading-[1.6] opacity-90 mb-3">Harness Universal Energy with a Sphere Crystal Pendulum. The sphere represents wholeness, unity, and the infinite flow of universal energy.</p>

              <button onClick={() => { setOpenAccordion('Description'); setTimeout(() => descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }} className="uppercase text-[12px] font-bold text-[#7F3E2F] mb-4 text-left bg-transparent border-none p-0">Learn more</button>
              <div className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6">${(activeVariant?.price || product.price).toFixed(2)} AUD <span className="text-sm font-normal opacity-70">incl. tax</span></div>

              {/* 1. BRACELET STYLE */}
              {product.variants?.some((v: any) => v.selectedOptions?.["Bracelet Style"]) && (
                <div className="border-[1.25px] border-[#280F0B] p-3 lg:p-2 lg:px-4 mb-4 lg:mb-6">
                  <p className="text-sm font-semibold uppercase tracking-widest mb-3">Bracelet Style</p>
                  <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2">
                    {product.variants
                      .filter((v: any, i: number, self: any[]) => 
                        self.findIndex(t => t.selectedOptions?.["Bracelet Style"] === v.selectedOptions?.["Bracelet Style"]) === i
                      )
                      .map((variant: any) => {
                        const styleName = variant.selectedOptions?.["Bracelet Style"];
                        const isSelected = activeVariant?.id === variant.id;

                        return (
                          <button
                            key={variant.id}
                            onClick={() => setActiveVariant(variant)}
                            className={`flex items-center gap-1 px-4 py-2 rounded-full border transition-all text-[13px] lg:text-[14px] justify-center lg:justify-start w-full lg:w-auto ${
                              isSelected ? 'bg-[#280F0B] text-white border-[#280F0B]' : 'bg-transparent text-[#280F0B] border-[#280F0B]'
                            }`}
                          >
                            <span className="whitespace-nowrap font-normal">{styleName}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* OUT OF STOCK BAR (Shows if quantity < 3) */}
              {isOutOfStock && (
                <div className="border border-[#280F0B] flex items-center justify-between px-4 py-3 mb-6 w-full bg-white/20">
                  <span className="font-bold text-[#280F0B] uppercase tracking-wider text-sm">
                    OUT OF STOCK
                  </span>
                  
                  <button 
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="flex items-center gap-2 bg-[#280F0B] text-[#F6D8AB] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-black transition-colors"
                  >
                    {/* Bell Icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Notify
                  </button>
                </div>
              )}

              {/* 2. JEWELLERY MATERIAL (Standard Pendants) */}
              {availableMaterials.length > 0 && !product.variants?.some((v: any) => v.selectedOptions?.["Bracelet Style"]) && (
                <div className="border-[1.25px] border-[#280F0B] p-3 lg:p-2 lg:px-4 mb-4 lg:mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold uppercase tracking-widest">Jewellery Material</p>
                    <div className="hidden lg:block">
                      <Image src="/assets/images/book.svg" alt="Material Guide" width={22} height={22} className="cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2">
                    {availableMaterials.map((option, index) => (
                      <div key={option.name} className="contents">
                        <button
                          onClick={() => handleMaterialClick(option.name)}
                          className={`flex items-center gap-1 px-4 py-2 rounded-full border transition-all text-[13px] lg:text-[14px] justify-center lg:justify-start w-full lg:w-auto ${
                            selectedMaterial === option.name ? 'bg-[#6C6AE4] text-white border-[#6C6AE4]' : 'bg-transparent text-[#280F0B] border-[#280F0B]'
                          }`}
                        >
                          <Image 
                            src={option.img} 
                            alt={option.name} 
                            width={20} 
                            height={24} 
                            className={`object-contain ${selectedMaterial === option.name ? 'brightness-0 invert' : ''}`} 
                          />
                          <span className="whitespace-nowrap font-normal">{option.name}</span>
                        </button>
                        {(index + 1) % 3 === 0 && <div className="hidden lg:block w-full h-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {hasChainOptions && (
              <div className="border-[1.25px] border-[#280F0B] p-3 lg:p-2 lg:px-4 mb-4 lg:mb-6">
                <p className="text-sm font-semibold uppercase tracking-widest mb-3">Chain Type</p>
                <div className="flex gap-3">
                  {chainOptions.map((chain) => (
                    <button
                      key={chain}
                      onClick={() => setSelectedChain(chain)}
                      className={`px-6 py-2 rounded-full border transition-all text-sm ${
                        selectedChain === chain 
                          ? 'bg-[#280F0B] text-white' 
                          : 'bg-transparent text-[#280F0B] border-[#280F0B]'
                      }`}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              </div>
            )} 

              <div className="w-full">
                {/* ONLY SHOW QUANTITY SELECTOR IF IN STOCK */}
                {!isOutOfStock && (
                  <div className="flex items-center w-fit border border-b-0 border-[#280F0B]">
                    <button className="px-4 py-2" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <button className="px-4 py-2" onClick={() => setQuantity(q => q + 1)}>+</button>
                  </div>
                )}

                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full text-white py-4 uppercase font-semibold tracking-wide mb-3 ${
                    isOutOfStock 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'relative overflow-hidden bg-[#592B1E] z-10 before:absolute before:inset-0 before:bg-[#280F0B] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
                </button>
                
                {!isOutOfStock && (
                  <button 
                    onClick={handleShopPay}
                    className="w-full bg-[#4A2CF0] text-white py-4 font-bold mb-3 flex items-center justify-center gap-1 transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Buy with 
                    <div className="relative w-[54px] h-[18px]"> 
                      <Image 
                        src="/assets/images/shop.svg" 
                        alt="Shop" 
                        fill 
                        className="object-contain brightness-0 invert" 
                      />
                    </div>
                  </button>
                )}
              </div>
             <div className="flex items-center gap-1 mt-2 ">
              <Image 
                src="/assets/images/truck.jpeg" 
                alt="Truck" 
                width={34} 
                height={34} 
                className="shrink-0 object-contain -translate-y-[1px]" 
              />
              <p className="text-[14px] lg:text-[15px] leading-tight">
                Orders are fulfilled within 24 hours. 3–5 business days delivery average.
              </p>
            </div>

              {/* Accordions */}
              <div className="mt-8">
                {specificSections.map((section) => {
                  const isOpen = openAccordion === section.title;
                  const isHtml = typeof section.content === 'string' && section.content.includes('<');

                  return (
                    <div key={section.title} className="border-b border-[#280F0B]/30 py-4">
                      <button 
                        onClick={() => setOpenAccordion(isOpen ? null : section.title)} 
                        className="w-full flex justify-between items-center text-left font-semibold text-[18px] bg-transparent border-none p-0 outline-none"
                      >
                        <span className="text-[#280F0B]">{section.title}</span>
                        <span className={`text-[#280F0B] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                          +
                        </span>
                      </button>

                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          isOpen ? 'max-h-[1000px] mt-4 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {isHtml ? (
                          <div 
                            className="text-[14px] text-[#280F0B] opacity-80 leading-relaxed space-y-2" 
                            dangerouslySetInnerHTML={{ __html: section.content }} 
                          />
                        ) : (
                          <p className="text-[14px] text-[#280F0B] opacity-80 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ... (Banner Section remains the same) ... */}
        <section className="mt-16 bg-gradient-to-b from-[#2A0F0A] to-[#1A0705]">
          <div className="w-full h-[35px] bg-[#C38154]" />
          <div className="px-6 lg:px-12 xl:px-24 2xl:px-32 max-w-[1920px] mx-auto">
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] lg:min-h-[560px] py-12 lg:py-0">
              <h2 className="font-lora italic font-medium text-[#F6D8AB] text-[48px] lg:text-[80px] xl:text-[96px] leading-[0.95] mb-[237px] lg:mb-0 lg:self-start lg:pt-24">Embrace<br />Spirituality.</h2>
              <p className="font-manrope text-[#F6D8AB] text-[14px] opacity-90 lg:max-w-[22rem] lg:justify-self-end lg:self-end lg:pb-16">Experience the natural energy of our ethically sourced crystals, designed to bring balance and harmony to your space.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3 – REVIEWS */}
        <section id="reviews-section" className="py-16 px-6 lg:px-12 xl:px-24 max-w-[2500px] mx-auto border-t border-[#280F0B10] mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
            
            {/* Left Side: Review Summary */}
            <div>
              <h2 className="text-[28px] lg:text-[40px] font-bold mb-6">Customer Reviews</h2>
              <div className="flex items-center gap-6 mb-8">
                <span className="text-[48px] lg:text-[64px] font-bold">
                  {reviewStats.average > 0 ? reviewStats.average.toFixed(1) : "0.0"}
                </span>
                <div>
                  <div className="text-[#F5B301] text-lg">
                    {"★".repeat(Math.round(reviewStats.average))}
                    {"☆".repeat(5 - Math.round(reviewStats.average))}
                  </div>
                  <p className="text-sm opacity-70">Based on {reviewStats.total} Ratings</p>
                </div>
              </div>
              
              <div className="space-y-2 max-w-[820px]">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm min-w-[30px] flex items-center gap-1">
                      <span className="text-[#F5B301]">★</span>{star}
                    </span>
                    <div className="flex-1 h-2 bg-[#5A4A1A]/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#F5B301] transition-all duration-500" 
                        style={{ 
                          width: `${reviewStats.percentages[star as keyof typeof reviewStats.percentages]}%` 
                        }} 
                      />
                    </div>
                    <span className="text-xs opacity-50 min-w-[30px]">
                      {reviewStats.distribution[star as keyof typeof reviewStats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Primary Write a Review Action */}
            <div className="w-full lg:max-w-[820px] lg:border lg:border-dashed border-[#280F0B] p-0 lg:p-12 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg lg:text-xl font-semibold mb-2 hidden lg:block">Review this product</h3>
              <p className="text-sm opacity-80 mb-6 hidden lg:block">Share your feedback with other customers</p>
              
              {/* Functional Write Review Button */}
              <button 
                onClick={handleWriteReview}
                className="w-full max-w-[820px] h-[51px] relative overflow-hidden bg-[#592B1E] text-white uppercase font-semibold flex items-center justify-center gap-3 transition-all z-10 before:absolute before:inset-0 before:bg-[#280F0B] before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 before:-z-10"
              >
                <Image src="/assets/images/write.svg" alt="write" width={20} height={20} />
                Write a review
              </button>
            </div>
          </div>

          {/* Top Reviews Section - Only displayed if reviews exist */}
          {reviews.length > 0 && (
            <div className="mt-16 border-t border-[#280F0B10] pt-16">
              <h3 className="text-xl font-semibold underline underline-offset-8 mb-8">Top reviews</h3>
              
              <div className="space-y-6">
                {reviews.slice(0, 6).map((review: any, index: number) => (
                  <div key={index} className="bg-[#FFC26F] p-6 lg:p-8 rounded-sm shadow-sm border border-[#280F0B05]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-[#280F0B]">{review.reviewer_name || 'Verified Buyer'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#F5B301] text-sm">
                            {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs opacity-60 font-medium">
                        {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>

                    {review.title && (
                      <p className="font-bold text-[#280F0B] mb-2 uppercase tracking-tight">{review.title}</p>
                    )}

                    <p className="text-[15px] text-[#280F0B] leading-relaxed mb-4">
                      {review.content || review.body}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-3 mt-4">
                        {review.images.map((img: any, i: number) => (
                          <div key={i} className="relative w-24 h-24 rounded-sm border border-[#280F0B10] overflow-hidden">
                            <Image src={img.image || img} alt="Review" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Klaviyo standard widget */}
          <div id="klaviyo-reviews-all" className="hidden" data-id={numericProductId} />
        </section>

        {/* SECTION 4 – RECOMMENDED FOR YOU */}
        <section className="pb-24 pt-4 px-6 lg:px-12 xl:px-24 max-w-[2500px] mx-auto">
          <h2 className="text-2xl lg:text-[32px] font-bold mb-10 text-[#280F0B]">
            Recommended for you
          </h2>
          
          {isRecLoading ? (
            <div className="flex justify-center py-10">
              <p className="animate-pulse font-lora">Loading recommendations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => (
                <div key={p.id} className="group cursor-pointer">
                  <Link href={`/product/${p.handle}`}>
                    <div className="aspect-square relative bg-[#F2EFEA] mb-4 overflow-hidden">
                      <Image 
                        src={p.image || '/assets/images/necklace-img.png'} 
                        alt={p.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                  </Link>
                  
                  <Link href={`/product/${p.handle}`}>
                    <h4 className="text-[#280F0B] text-[14px] font-semibold mb-1 truncate">{p.title}</h4>
                  </Link>

                  <div className="relative h-8 overflow-hidden group/btn flex items-center justify-between">
                    <p className="text-[#280F0B] text-[13px] opacity-70 font-medium transition-all duration-300 transform translate-y-0 lg:group-hover:translate-y-[-100%] lg:group-hover:opacity-0 flex items-center h-full">
                      ${p.price.toFixed(2)} AUD
                    </p>

                    <button 
                      onClick={() => {
                        addToCart({ 
                          id: p.id, 
                          title: p.title, 
                          variant: "Default", 
                          price: p.price, 
                          image: p.image 
                        }, 1);
                        setIsCartOpen(true);
                      }}
                      className="lg:hidden text-[14px] opacity-70 font-medium text-[#7A3E2E] active:opacity-100 transition-opacity"
                    >
                      + Add to Cart
                    </button>

                    <button 
                      onClick={() => {
                        addToCart({ 
                          id: p.id, 
                          title: p.title, 
                          variant: "Default", 
                          price: p.price, 
                          image: p.image 
                        }, 1);
                        setIsCartOpen(true);
                      }}
                      className="hidden lg:flex absolute top-0 left-0 w-full h-full text-[#280F0B] text-[14px] opacity-70 font-medium text-left transition-all duration-300 transform translate-y-[100%] group-hover:translate-y-0 items-center hover:text-black"
                    >
                      + Add to Cart 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </main>
    </>
  );
}
